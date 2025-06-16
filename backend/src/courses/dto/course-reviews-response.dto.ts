import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
import { CourseReview as CourseReviewEntity } from 'src/_gen/prisma-class/course_review';

export class CourseReviewsResponseDto {
  @ApiProperty({ description: '내 리뷰 존재 여부', type: Boolean })
  @IsBoolean()
  @IsNotEmpty()
  myReviewExists: boolean;

  @ApiProperty({ description: '총 리뷰 수', type: Number })
  @IsNumber()
  @IsNotEmpty()
  totalReviewCount: number;

  @ApiProperty({ description: '현재 페이지', type: Number })
  @IsNumber()
  @IsNotEmpty()
  currentPage: number;

  @ApiProperty({ description: '페이지 크기', type: Number })
  @IsNumber()
  @IsNotEmpty()
  pageSize: number;

  @ApiProperty({ description: '총 페이지 수', type: Number })
  @IsNumber()
  @IsNotEmpty()
  totalPages: number;

  @ApiProperty({ description: '다음 페이지 존재 여부', type: Boolean })
  @IsBoolean()
  @IsNotEmpty()
  hasNext: boolean;

  @ApiProperty({ description: '이전 페이지 존재 여부', type: Boolean })
  @IsBoolean()
  @IsNotEmpty()
  hasPrev: boolean;

  @ApiProperty({
    description: '전체 리뷰',
    type: CourseReviewEntity,
    isArray: true,
  })
  @IsArray()
  reviews: CourseReviewEntity[];
}
