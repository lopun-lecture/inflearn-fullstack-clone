import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByInstructorId(instructorId: string) {
    const allQuestions = await this.prisma.courseQuestion.findMany({
      where: {
        course: {
          instructorId,
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
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return allQuestions;
  }

  async create(
    userId: string,
    courseId: string,
    createQuestionDto: CreateQuestionDto,
  ) {
    const enrollment = await this.prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        '수강 신청하신 강의에만 질문을 작성하실 수 있습니다.',
      );
    }

    return this.prisma.courseQuestion.create({
      data: {
        ...createQuestionDto,
        user: {
          connect: {
            id: userId,
          },
        },
        course: {
          connect: {
            id: courseId,
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
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
  }

  async findAll(courseId: string) {
    return this.prisma.courseQuestion.findMany({
      where: {
        courseId,
      },
    });
  }

  async findOne(questionId: string) {
    const question = await this.prisma.courseQuestion.findUnique({
      where: { id: questionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        comments: {
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
          orderBy: {
            createdAt: 'desc',
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            instructorId: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('질문을 찾을 수 없습니다. ');
    }

    return question;
  }

  async update(
    userId: string,
    questionId: string,
    updateQuestionDto: UpdateQuestionDto,
  ) {
    const question = await this.prisma.courseQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('질문을 찾을 수 없습니다.');
    }

    if (question.userId !== userId) {
      throw new ForbiddenException('본인이 작성한 질문만 수정할 수 있습니다.');
    }

    return this.prisma.courseQuestion.update({
      where: {
        id: questionId,
      },
      data: updateQuestionDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
  }

  async remove(userId: string, questionId: string) {
    const question = await this.prisma.courseQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('질문을 찾을 수 없습니다.');
    }

    if (question.userId !== userId) {
      throw new ForbiddenException('본인이 작성한 질문만 삭제할 수 있습니다.');
    }

    await this.prisma.courseQuestion.delete({
      where: { id: questionId },
    });

    return true;
  }
}
