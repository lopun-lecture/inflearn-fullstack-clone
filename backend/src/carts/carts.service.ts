import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { CartItem as CartItemEntity } from 'src/_gen/prisma-class/cart_item';

@Injectable()
export class CartsService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(userId: string, { courseId }: AddToCartDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('강의를 찾을 수 없습니다.');
    }

    // 자신의 강의인지 확인
    if (course.instructorId === userId) {
      throw new BadRequestException(
        '본인의 강의는 장바구니에 추가할 수 없습니다.',
      );
    }

    const enrollment = await this.prisma.courseEnrollment.findFirst({
      where: {
        userId,
        courseId,
      },
    });

    if (enrollment) {
      throw new ConflictException('이미 수강중인 강의입니다.');
    }

    const existingCartItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingCartItem) {
      throw new ConflictException('이미 장바구니에 추가된 강의입니다.');
    }

    const cartItem = await this.prisma.cartItem.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        course: {
          connect: {
            id: courseId,
          },
        },
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return cartItem;
  }

  async getCartItems(userId: string): Promise<CartResponseDto> {
    const cartItems = await this.prisma.cartItem.findMany({
      where: {
        userId,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.course.price,
      0,
    );

    return {
      items: cartItems as CartItemEntity[],
      totalCount: cartItems.length,
      totalAmount,
    };
  }

  async removeFromCart(userId: string, courseId: string): Promise<boolean> {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('장바구니에 추가된 강의가 없습니다.');
    }

    await this.prisma.cartItem.delete({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    return true;
  }

  async clearCart(userId: string): Promise<boolean> {
    await this.prisma.cartItem.deleteMany({
      where: {
        userId,
      },
    });

    return true;
  }
}
