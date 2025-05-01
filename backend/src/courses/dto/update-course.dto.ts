import { PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @ApiProperty({ description: '코스 1~2줄 짧은 설명', required: false })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({ description: '코스 상태', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: '코스 상세페이지 설명', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '썸네일 이미지 URL', required: false })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ description: '코스 가격', required: false })
  @IsNumber()
  price: number;

  @ApiProperty({ description: '코스 할인 가격', required: false })
  @IsNumber()
  @IsOptional()
  discountPrice?: number;

  @ApiProperty({ description: '코스 난이도', required: false })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiProperty({ description: '코스 카테고리 ID 목록', required: false })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  categoryIds?: string[];
}
