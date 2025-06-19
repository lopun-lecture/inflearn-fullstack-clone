import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: '댓글 내용',
    example: '해당 부분은 다음과 같이 이해하시면 됩니다...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
