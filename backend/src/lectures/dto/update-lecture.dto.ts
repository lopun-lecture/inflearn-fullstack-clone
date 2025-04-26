import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateLectureDto } from './create-lecture.dto';
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateLectureDto extends PartialType(CreateLectureDto) {
  @ApiProperty({ description: '개별 강의 설명', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '개별 강의 순서', required: false })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({ description: '개별 강의 길이', required: false })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiProperty({
    description: '개별 강의 무료(미리보기) 여부',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPreview?: boolean;

  @ApiProperty({ description: '개별 강의 비디오 업로드 정보', required: false })
  @IsObject()
  @IsOptional()
  videoStorageInfo?: Record<string, any>;
}
