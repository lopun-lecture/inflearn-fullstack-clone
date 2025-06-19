import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    questionId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const question = await this.prisma.courseQuestion.findUnique({
      where: { id: questionId },
      include: {
        course: {
          select: {
            instructorId: true,
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('질문을 찾을 수 없습니다.');
    }
    const isInstructor = question.course.instructorId === userId;

    const enrollment = this.prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: question.courseId,
        },
      },
    });

    if (!enrollment && !isInstructor) {
      throw new ForbiddenException(
        '수강 신청한 강의 또는 본인이 개설한 강의에만 댓글을 작성할 수 있습니다.',
      );
    }

    return this.prisma.courseComment.create({
      data: {
        ...createCommentDto,
        user: {
          connect: {
            id: userId,
          },
        },
        question: {
          connect: {
            id: questionId,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  async update(
    userId: string,
    commentId: string,
    updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.prisma.courseComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('본인의 댓글만 수정할 수 있습니다.');
    }

    return this.prisma.courseComment.update({
      where: { id: commentId },
      data: updateCommentDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  async remove(userId: string, commentId: string) {
    const comment = await this.prisma.courseComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('본인의 댓글만 삭제할 수 있습니다.');
    }

    await this.prisma.courseComment.delete({
      where: { id: commentId },
    });

    return true;
  }
}
