import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async calculateDailyStats() {
    this.logger.log('일간 결제 통계 배치 시작');

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date(yesterday);
      today.setDate(today.getDate() + 1);

      const payments = await this.prisma.payment.findMany({
        where: {
          status: 'PAID',
          paidAt: {
            gte: yesterday,
            lt: today,
          },
        },
        select: {
          amount: true,
        },
      });

      const totalPayments = payments.length;
      const totalAmount = payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );

      await this.prisma.dailyPaymentStats.upsert({
        where: {
          date: yesterday,
        },
        update: {
          totalPayments,
          totalAmount,
        },
        create: {
          date: yesterday,
          totalPayments,
          totalAmount,
        },
      });
      this.logger.log(
        `일간 결제 통계 배치 완료 - 날짜: ${yesterday.toISOString().split('T')[0]}, 결제건수: ${totalPayments}, 총금액: ${totalAmount.toLocaleString()}원`,
      );
    } catch (error) {
      this.logger.error('일간 결제 통계 배치 실패', error);
      throw error;
    }
  }

  async runManualStats(targetDate?: string) {
    try {
      const date = targetDate ? new Date(targetDate) : new Date();

      const yesterday = date;
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date(yesterday);
      today.setDate(today.getDate() + 1);

      const payments = await this.prisma.payment.findMany({
        where: {
          status: 'PAID',
          paidAt: {
            gte: yesterday,
            lt: today,
          },
        },
        select: {
          amount: true,
        },
      });

      const totalPayments = payments.length;
      const totalAmount = payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );

      await this.prisma.dailyPaymentStats.upsert({
        where: {
          date: yesterday,
        },
        update: {
          totalPayments,
          totalAmount,
        },
        create: {
          date: yesterday,
          totalPayments,
          totalAmount,
        },
      });
      this.logger.log(
        `일간 결제 통계 배치 완료 - 날짜: ${yesterday.toISOString().split('T')[0]}, 결제건수: ${totalPayments}, 총금액: ${totalAmount.toLocaleString()}원`,
      );
    } catch (error) {
      this.logger.error('일간 결제 통계 배치 실패', error);
      throw error;
    }
  }
}
