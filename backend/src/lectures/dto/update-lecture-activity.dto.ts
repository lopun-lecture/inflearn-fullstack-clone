import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateLectureActivityDto {
  @ApiProperty({ description: '강의 진행 상황' })
  @IsNotEmpty()
  @IsNumber()
  progress: number;

  @ApiProperty({ description: '강의 재생 시간' })
  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @ApiProperty({ description: '강의 완료 여부' })
  @IsNotEmpty()
  @IsBoolean()
  isCompleted: boolean;

  @ApiProperty({ description: '마지막 시청 시간' })
  @IsNotEmpty()
  @IsDate()
  lastWatchedAt: Date;
}
