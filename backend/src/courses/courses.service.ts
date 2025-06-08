import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Course, Prisma } from '@prisma/client';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import slugify from 'lib/slugify';
import { SearchCourseDto } from './dto/search-course.dto';
import { SearchCourseResponseDto } from './dto/search-response.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    createCourseDto: CreateCourseDto,
  ): Promise<Course> {
    return this.prisma.course.create({
      data: {
        title: createCourseDto.title,
        slug: slugify(createCourseDto.title),
        instructorId: userId,
        status: 'DRAFT',
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CourseWhereUniqueInput;
    where?: Prisma.CourseWhereInput;
    orderBy?: Prisma.CourseOrderByWithRelationInput;
  }): Promise<Course[]> {
    const { skip, take, cursor, where, orderBy } = params;

    return this.prisma.course.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findOne(
    id: string,
    include?: Prisma.CourseInclude,
  ): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include,
    });

    return course;
  }

  async update(
    id: string,
    userId: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`ID: ${id} 코스를 찾을 수 없습니다.`);
    }

    const { categoryIds, ...otherData } = updateCourseDto;
    let data: Prisma.CourseUpdateInput = {
      ...otherData,
    };

    if (course.instructorId !== userId) {
      throw new UnauthorizedException('강의의 소유자만 수정할 수 있습니다.');
    }

    if (categoryIds && categoryIds.length > 0) {
      data.categories = {
        connect: categoryIds.map((id) => ({ id })),
      };
    }

    return this.prisma.course.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`ID: ${id} 코스를 찾을 수 없습니다.`);
    }

    if (course.instructorId !== userId) {
      throw new UnauthorizedException('강의의 소유자만 삭제할 수 있습니다.');
    }

    await this.prisma.course.delete({
      where: { id },
    });

    return course;
  }

  async searchCourses(
    searchCourseDto: SearchCourseDto,
  ): Promise<SearchCourseResponseDto> {
    const { q, category, priceRange, sortBy, order, page, pageSize } =
      searchCourseDto;

    const where: Prisma.CourseWhereInput = {};

    if (q) {
      where.OR = [
        // title에 포함된 키워드
        {
          title: {
            contains: q,
            mode: 'insensitive',
          },
        },
        // instructor(지식공유자) 이름이 포함된 키워드
        {
          instructor: {
            name: {
              contains: q,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    if (category) {
      where.categories = {
        some: {
          id: category,
        },
      };
    }

    if (priceRange) {
      const priceConditions: any = {};
      if (priceRange.min !== undefined) {
        priceConditions.gte = priceRange.min;
      }
      if (priceRange.max !== undefined) {
        priceConditions.lte = priceRange.max;
      }
      if (Object.keys(priceConditions).length > 0) {
        where.price = priceConditions;
      }
    }

    const orderBy: Prisma.CourseOrderByWithRelationInput = {};
    if (sortBy === 'price') {
      orderBy.price = order as 'asc' | 'desc';
    }

    const skip = (page - 1) * pageSize;
    const totalItems = await this.prisma.course.count({ where });
    const courses = await this.prisma.course.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
        categories: true,
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      courses: courses as any[],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNext,
        hasPrev,
      },
    };
  }
}
