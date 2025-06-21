import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { BatchService } from './batch.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@Controller('admin/batch')
@UseGuards(AccessTokenGuard)
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post('payment-stats')
  async runPaymentStats(@Query('date') date?: string) {
    return await this.batchService.runManualStats(date);
  }
}
