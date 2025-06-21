import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import * as PortOne from '@portone/server-sdk';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaidPayment } from '@portone/server-sdk/dist/generated/payment';
import { Course as CourseEntity } from 'src/_gen/prisma-class/course';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly portOneClient: PortOne.PortOneClient;

  constructor(private readonly prisma: PrismaService) {
    this.portOneClient = PortOne.PortOneClient({
      secret: process.env.PORTONE_API_SECRET,
    });
  }

  async verifyPayment(verifyPaymentDto: VerifyPaymentDto, userId: string) {
    try {
      const payment = await this.portOneClient.payment.getPayment({
        paymentId: verifyPaymentDto.paymentId,
      });

      if (payment.status !== 'PAID') {
        throw new BadRequestException('결제가 완료되지 않았습니다.');
      }

      const customData = payment.customData
        ? JSON.parse(payment.customData)
        : null;

      if (!customData || !customData.items) {
        throw new BadRequestException('주문 정보가 없습니다.');
      }

      const courseIds = customData.items.map((item: any) => item.courseId);
      const courses = await this.prisma.course.findMany({
        where: {
          id: {
            in: courseIds,
          },
        },
        include: {
          instructor: true,
        },
      });

      if (courses.length !== courseIds.length) {
        throw new BadRequestException('존재하지 않는 강의가 있습니다.');
      }

      const expectedAmount = courses.reduce((sum, course) => {
        return sum + (course.discountPrice || course.price);
      }, 0);

      if (expectedAmount !== payment.amount.total) {
        throw new BadRequestException('결제 금액이 일치하지 않습니다.');
      }

      const existingPayment = await this.prisma.payment.findUnique({
        where: {
          paymentId: verifyPaymentDto.paymentId,
        },
      });

      if (existingPayment) {
        return { success: true, message: '이미 처리된 결제입니다.' };
      }

      return await this.processPayment(
        payment,
        customData,
        courses as CourseEntity[],
        userId,
      );
    } catch (error) {
      this.logger.error('결제 검증에 실패하였습니다', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('결제 검증 중 오류가 발생했습니다.');
    }
  }

  private async processPayment(
    payment: PaidPayment,
    customData: any,
    courses: CourseEntity[],
    userId: string,
  ) {
    const orderNumber = `ORD-${userId}-${Date.now()}`;
    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          totalAmount: payment.amount.total,
          discountAmount: 0,
          finalAmount: payment.amount.total,
          status: 'PAID',
          customerName: customData.customerInfo.customerName,
          customerEmail: customData.customerInfo.customerEmail,
          customerPhone: customData.customerInfo.customerPhone,
        },
      });

      await tx.payment.create({
        data: {
          paymentId: payment.id,
          orderId: order.id,
          amount: payment.amount.total,
          currency: 'KRW',
          paymentMethod: payment.method?.type?.toString() || 'UNKNOWN',
          pgProvider: payment.channel.pgProvider,
          status: 'PAID',
          paidAt: new Date(),
          portoneData: payment as any,
        },
      });

      const orderItems = await Promise.all(
        courses.map((course) =>
          tx.orderItem.create({
            data: {
              orderId: order.id,
              courseId: course.id,
              courseName: course.title,
              originalPrice: course.price,
              discountPrice: course.discountPrice,
              finalPrice: course.discountPrice || course.price,
            },
          }),
        ),
      );

      await tx.cartItem.deleteMany({
        where: {
          userId,
          courseId: {
            in: courses.map((course) => course.id),
          },
        },
      });

      await Promise.all(
        courses.map((course) =>
          tx.courseEnrollment.upsert({
            where: {
              userId_courseId: {
                userId,
                courseId: course.id,
              },
            },
            create: {
              user: {
                connect: {
                  id: userId,
                },
              },
              course: {
                connect: {
                  id: course.id,
                },
              },
              enrolledAt: new Date(),
            },
            update: {},
          }),
        ),
      );

      return {
        order,
        orderItems,
      };
    });

    this.logger.log(`결제 처리 완료 : ${result.order.id}`);

    return {
      success: true,
      message: '결제가 성공적으로 완료되었습니다',
      orderId: result.order.id,
    };
  }

  async handleWebhook(body: string, headers: Record<string, string>) {
    try {
      const webhook = await PortOne.Webhook.verify(
        process.env.PORTONE_WEBHOOK_SECRET,
        body,
        headers,
      );

      if ('data' in webhook && 'paymentId' in webhook.data) {
        const paymentId = webhook.data.paymentId;

        const payment = await this.portOneClient.payment.getPayment({
          paymentId,
        });

        const existingPayment = await this.prisma.payment.findUnique({
          where: {
            paymentId,
          },
        });

        if (existingPayment) {
          await this.prisma.payment.update({
            where: {
              paymentId,
            },
            data: {
              status: String(payment.status),
              portoneData: payment as any,
              ...(payment.status === 'PAID' && { paidAt: new Date() }),
              ...(payment.status === 'CANCELLED' && {
                cancelledAt: new Date(),
              }),
            },
          });

          await this.prisma.order.update({
            where: {
              id: existingPayment.orderId,
            },
            data: {
              status: String(payment.status),
            },
          });

          this.logger.log(
            `결제 상태 업데이트 : ${paymentId} - ${String(payment.status)}`,
          );
        }

        return {
          success: true,
        };
      }
    } catch (error) {
      this.logger.error('웹훅 처리 오류', error);
      throw new BadRequestException('웹훅 처리 중 오류가 발생했습니다.');
    }
  }
}
