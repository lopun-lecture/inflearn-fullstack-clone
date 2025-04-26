import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';

@Injectable()
export class LecturesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    sectionId: string,
    createLectureDto: CreateLectureDto,
    userId: string,
  ) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        course: {
          select: {
            instructorId: true,
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundException('섹션을 찾을 수 없습니다.');
    }

    if (section.course.instructorId !== userId) {
      throw new UnauthorizedException(
        '이 섹션에 강의를 추가할 권한이 없습니다.',
      );
    }

    const lastLecture = await this.prisma.lecture.findFirst({
      where: { sectionId },
      orderBy: { order: 'desc' },
    });

    const order = lastLecture ? lastLecture.order + 1 : 0;

    return this.prisma.lecture.create({
      data: {
        ...createLectureDto,
        order,
        section: {
          connect: {
            id: sectionId,
          },
        },
        course: {
          connect: {
            id: section.courseId,
          },
        },
      },
    });
  }

  async update(
    lectureId: string,
    updateLectureDto: UpdateLectureDto,
    userId: string,
  ) {
    const lecture = await this.prisma.lecture.findUnique({
      where: { id: lectureId },
      include: {
        course: {
          select: {
            instructorId: true,
          },
        },
      },
    });

    if (!lecture) {
      throw new NotFoundException('개별 강의를 찾을 수 없습니다.');
    }

    if (lecture.course.instructorId !== userId) {
      throw new UnauthorizedException('이 강의를 수정할 권한이 없습니다.');
    }

    return this.prisma.lecture.update({
      where: { id: lectureId },
      data: updateLectureDto,
    });
  }

  async findOne(lectureId: string, userId: string) {
    const lecture = await this.prisma.lecture.findUnique({
      where: { id: lectureId },
      include: {
        course: {
          select: {
            instructorId: true,
          },
        },
      },
    });

    if (!lecture) {
      throw new NotFoundException('개별 강의를 찾을 수 없습니다.');
    }

    if (lecture.course.instructorId !== userId) {
      throw new UnauthorizedException('이 강의를 조회할 권한이 없습니다.');
    }

    return lecture;
  }

  async remove(lectureId: string, userId: string) {
    const lecture = await this.prisma.lecture.findUnique({
      where: { id: lectureId },
      include: {
        course: {
          select: {
            instructorId: true,
          },
        },
      },
    });

    if (!lecture) {
      throw new NotFoundException('개별 강의를 찾을 수 없습니다.');
    }

    if (lecture.course.instructorId !== userId) {
      throw new UnauthorizedException('이 강의를 삭제할 권한이 없습니다.');
    }

    await this.prisma.lecture.delete({
      where: { id: lectureId },
    });

    return lecture;
  }
}
