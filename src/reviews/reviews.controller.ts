import { Controller, Post, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private svc: ReviewsService) {}

  @Post('transaction/:txId')
  @ApiOperation({ summary: 'Beri rating setelah pekerjaan selesai' })
  create(
    @Param('txId', ParseIntPipe) txId: number,
    @Request() req: any,
    @Body() dto: { rating: number; comment?: string },
  ) {
    return this.svc.create(txId, req.user.userId, dto);
  }
}
