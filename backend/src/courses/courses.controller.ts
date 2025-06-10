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
import { GetFavoriteResponseDto } from './dto/favorite.dto';
import { OptionalAccessTokenGuard } from 'src/auth/guards/optional-access-token.guard';
import { CourseFavorite as CourseFavoriteEntity } from 'src/_gen/prisma-class/course_favorite';

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
  @UseGuards(OptionalAccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: '코스 상세 정보',
    type: CourseDetailDto,
  })
  findOne(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findOne(id, req.user?.sub);
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

  // 즐겨찾기 등록
  @Post(':id/favorite')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: Boolean })
  addFavorite(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.addFavorite(id, req.user.sub);
  }

  // 즐겨찾기 삭제
  @Delete(':id/favorite')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: Boolean })
  removeFavorite(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.removeFavorite(id, req.user.sub);
  }

  // 개별 강의 즐겨찾기 조회
  @Get(':id/favorite')
  @UseGuards(OptionalAccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: GetFavoriteResponseDto })
  getFavorite(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.getFavorite(id, req.user?.sub);
  }

  // 나의 모든 즐겨찾기 조회
  @Get('favorites/my')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: CourseFavoriteEntity, isArray: true })
  getMyFavorites(@Req() req: Request) {
    return this.coursesService.getMyFavorites(req.user.sub);
  }

  @Post(':id/enroll')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: Boolean })
  enrollCourse(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.enrollCourse(id, req.user.sub);
  }
}
