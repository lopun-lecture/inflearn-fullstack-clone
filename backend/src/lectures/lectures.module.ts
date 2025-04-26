import { Module } from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { LecturesController } from './lectures.controller';

@Module({
  controllers: [LecturesController],
  providers: [LecturesService],
})
export class LecturesModule {}
