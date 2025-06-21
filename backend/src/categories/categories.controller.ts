import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseCategory as CourseCategoryEntity } from 'src/_gen/prisma-class/course_category';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('카테고리')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('')
  @ApiOperation({ summary: '카테고리 리스트' })
  @ApiOkResponse({
    description: '카테고리를 성공적으로 가져옴',
    type: CourseCategoryEntity,
    isArray: true,
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(5 * 60 * 1000)
  findAll() {
    console.log('카테고리 DB에서 조회');
    return this.categoriesService.findAll();
  }
}
