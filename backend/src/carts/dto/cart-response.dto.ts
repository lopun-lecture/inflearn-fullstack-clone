import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
import { CartItem as CartItemEntity } from 'src/_gen/prisma-class/cart_item';

export class CartResponseDto {
  @ApiProperty({
    description: '장바구니 아이템 목록',
    type: CartItemEntity,
    isArray: true,
  })
  @IsArray()
  items: CartItemEntity[];

  @ApiProperty({ description: '총 개수', type: Number })
  @IsNumber()
  totalCount: number;

  @ApiProperty({ description: '총 주문 금액', type: Number })
  @IsNumber()
  totalAmount: number;
}
