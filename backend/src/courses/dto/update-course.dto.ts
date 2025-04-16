// TODO: 테스트 시간에 nestjs/swagger로 수정하도록 설명하기
import { PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
