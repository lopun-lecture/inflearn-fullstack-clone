import { IsNotEmpty, IsString } from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;
}
