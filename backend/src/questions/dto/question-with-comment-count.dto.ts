import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { CourseQuestion } from 'src/_gen/prisma-class/course_question';

export class CountWithComment {
  @ApiProperty({
    description: '댓글 개수',
    example: 10,
  })
  @IsNumber()
  comments: number;
}

export class QuestionWithCommentCountDto extends CourseQuestion {
  @ApiProperty({
    description: '댓글 개수',
    type: CountWithComment,
  })
  _count: CountWithComment;
}
