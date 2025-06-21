import {
  Body,
  Controller,
  Headers,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('결제')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('verify')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  async verifyPayment(
    @Body() verifyPaymentDto: VerifyPaymentDto,
    @Req() req: Request,
  ) {
    console.log('verifyPaymentDto', verifyPaymentDto);
    return this.paymentsService.verifyPayment(verifyPaymentDto, req.user.sub);
  }

  @Post('webhook')
  async handleWebook(
    @Body() body: string,
    @Headers() headers: Record<string, string>,
  ) {
    this.logger.log('Payment webook 받음');
    return this.paymentsService.handleWebhook(body, headers);
  }
}
