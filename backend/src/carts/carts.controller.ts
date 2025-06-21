import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { Request } from 'express';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartItem as CartItemEntity } from 'src/_gen/prisma-class/cart_item';
import { CartResponseDto } from './dto/cart-response.dto';

@ApiTags('카트')
@Controller('carts')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth('access-token')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @ApiOkResponse({
    description: '장바구니에 강의 추가',
    type: CartItemEntity,
  })
  async addToCart(@Req() req: Request, @Body() addToCartDto: AddToCartDto) {
    const userId = req.user.sub;
    const cartItem = await this.cartsService.addToCart(userId, addToCartDto);

    return cartItem;
  }

  @Get()
  @ApiOkResponse({
    description: '장바구니 아이템 목록 조회',
    type: CartResponseDto,
  })
  async getCartItems(@Req() req: Request) {
    const userId = req.user.sub;
    const cartItems = await this.cartsService.getCartItems(userId);

    return cartItems;
  }

  @Delete(':courseId')
  @ApiOkResponse({
    description: '장바구니에서 강의 제거',
    type: Boolean,
  })
  async removeFromCart(
    @Req() req: Request,
    @Param('courseId') courseId: string,
  ) {
    const userId = req.user.sub;
    await this.cartsService.removeFromCart(userId, courseId);

    return true;
  }

  @Delete()
  @ApiOkResponse({
    description: '장바구니 비우기',
    type: Boolean,
  })
  async clearCart(@Req() req: Request) {
    const userId = req.user.sub;
    await this.cartsService.clearCart(userId);

    return true;
  }
}
