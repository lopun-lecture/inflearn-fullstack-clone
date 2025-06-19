import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { CourseComment as CourseCommentEntity } from 'src/_gen/prisma-class/course_comment';
import { Request } from 'express';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('댓글')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('questions/:questionId/comments')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: '질문에 댓글 작성',
    type: CourseCommentEntity,
  })
  create(
    @Req() req: Request,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(
      req.user.sub,
      questionId,
      createCommentDto,
    );
  }

  @Put('comments/:commentId')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: '댓글 수정',
    type: CourseCommentEntity,
  })
  update(
    @Req() req: Request,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(
      req.user.sub,
      commentId,
      updateCommentDto,
    );
  }

  @Delete('comments/:commentId')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: '댓글 삭제',
    type: Boolean,
  })
  remove(
    @Req() req: Request,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ) {
    return this.commentsService.remove(req.user.sub, commentId);
  }
}
