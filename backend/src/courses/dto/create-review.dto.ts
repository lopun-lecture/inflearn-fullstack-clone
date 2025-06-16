import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: '수강평 내용',
    example: '정말 유익한 강의였습니다.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: '평점 (1~5)', example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}
