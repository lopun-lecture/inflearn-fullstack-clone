import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({
    description: '질문 제목',
    example: '강의에서 설명한 부분에 대한 질문입니다.',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '질문 내용',
    example:
      '5분 12초 부분에서 설명하신 내용이 이해가 잘 안되는데, 좀 더 자세히 설명해주실 수 있나요?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
