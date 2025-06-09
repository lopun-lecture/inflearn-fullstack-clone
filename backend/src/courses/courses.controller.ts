import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { Course as CourseEntity } from 'src/_gen/prisma-class/course';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { CoursesService } from './courses.service';
import { CourseDetailDto } from './dto/course-deatil.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { SearchCourseDto } from './dto/search-course.dto';
import { SearchCourseResponseDto } from './dto/search-response.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('코스')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: '코스 생성',
    type: CourseEntity,
  })
  create(@Req() req: Request, @Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(req.user.sub, createCourseDto);
  }

  @Get()
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'level', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiOkResponse({
    description: '코스 목록',
    type: CourseEntity,
    isArray: true,
  })
  findAll(
    @Query('title') title?: string,
    @Query('level') level?: string,
    @Query('categoryId') categoryId?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const where: Prisma.CourseWhereInput = {};

    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }

    if (level) {
      where.level = level;
    }

    if (categoryId) {
      where.categories = {
        some: {
          id: categoryId,
        },
      };
    }

    return this.coursesService.findAll({
      where,
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  @Get(':id')
  @ApiOkResponse({
    description: '코스 상세 정보',
    type: CourseDetailDto,
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: '코스 수정',
    type: CourseEntity,
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, req.user.sub, updateCourseDto);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: '코스 삭제',
    type: CourseEntity,
  })
  delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.coursesService.delete(id, req.user.sub);
  }

  @Post('search')
  @ApiOkResponse({
    description: '코스 검색',
    type: SearchCourseResponseDto,
  })
  search(@Body() searchCourseDto: SearchCourseDto) {
    return this.coursesService.searchCourses(searchCourseDto);
  }
}
