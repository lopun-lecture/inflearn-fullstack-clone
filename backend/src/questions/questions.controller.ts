import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CourseQuestion as CourseQuestionEntity } from 'src/_gen/prisma-class/course_question';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { Request } from 'express';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionWithCommentCountDto } from './dto/question-with-comment-count.dto';

@ApiTags('질문')
@Controller('')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get('instructor/questions')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: '지식공유자의 모든 질문 조회',
    type: QuestionWithCommentCountDto,
    isArray: true,
  })
  findAllByInstructorId(@Req() req: Request) {
    return this.questionsService.findAllByInstructorId(req.user.sub);
  }

  @Get('courses/:courseId/questions')
  @ApiOkResponse({
    description: '강의 질문 목록 조회',
    type: CourseQuestionEntity,
    isArray: true,
  })
  findAll(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.questionsService.findAll(courseId);
  }

  @Post('courses/:courseId/questions')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: '강의 질문 생성',
    type: CourseQuestionEntity,
  })
  create(
    @Req() req: Request,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    return this.questionsService.create(
      req.user.sub,
      courseId,
      createQuestionDto,
    );
  }

  @Get('questions/:questionId')
  @ApiOkResponse({
    description: '강의 질문 상세 조회',
    type: CourseQuestionEntity,
  })
  findOne(@Param('questionId', ParseUUIDPipe) questionId: string) {
    return this.questionsService.findOne(questionId);
  }

  @Put('questions/:questionId')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: '강의 질문 수정',
    type: CourseQuestionEntity,
  })
  update(
    @Req() req: Request,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(
      req.user.sub,
      questionId,
      updateQuestionDto,
    );
  }

  @Delete('questions/:questionId')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: '강의 질문 삭제',
  })
  remove(
    @Req() req: Request,
    @Param('questionId', ParseUUIDPipe) questionId: string,
  ) {
    return this.questionsService.remove(req.user.sub, questionId);
  }
}
