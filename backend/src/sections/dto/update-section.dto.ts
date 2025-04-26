import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSectionDto } from './create-section.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSectionDto extends PartialType(CreateSectionDto) {
  @ApiProperty({ description: '섹션 설명', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '섹션 순서', required: false })
  @IsNumber()
  @IsOptional()
  order?: number;
}
