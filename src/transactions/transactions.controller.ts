import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private svc: TransactionsService) {}

  // STEP 1: Petani mulai transaksi
  @Post('start/:applicationId')
  @UseGuards(RolesGuard)
  @Roles('petani')
  @ApiOperation({ summary: 'STEP 1 - Petani mulai transaksi setelah pilih buruh [PETANI]' })
  start(@Param('applicationId', ParseIntPipe) appId: number, @Request() req: any) {
    return this.svc.createFromApplication(appId, req.user.userId);
  }

  // STEP 2: Buruh konfirmasi pekerjaan selesai
  @Patch(':id/worker-confirm')
  @UseGuards(RolesGuard)
  @Roles('buruh')
  @ApiOperation({ summary: 'STEP 2 - Buruh konfirmasi pekerjaan selesai [BURUH]' })
  workerConfirm(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.svc.workerConfirm(id, req.user.userId);
  }

  // STEP 3: Petani verifikasi pekerjaan selesai
  @Patch(':id/farmer-verify')
  @UseGuards(RolesGuard)
  @Roles('petani')
  @ApiOperation({ summary: 'STEP 3 - Petani verifikasi pekerjaan selesai [PETANI]' })
  farmerVerify(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.svc.farmerVerify(id, req.user.userId);
  }

  // STEP 4: Petani bayar upah
  @Patch(':id/pay')
  @UseGuards(RolesGuard)
  @Roles('petani')
  @ApiOperation({ summary: 'STEP 4 - Petani bayar upah ke buruh [PETANI]' })
  pay(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() dto: { paymentMethod: string; paymentProof?: string },
  ) {
    return this.svc.farmerPay(id, req.user.userId, dto);
  }

  // STEP 5: Buruh konfirmasi terima bayaran
  @Patch(':id/confirm-payment')
  @UseGuards(RolesGuard)
  @Roles('buruh')
  @ApiOperation({ summary: 'STEP 5 - Buruh konfirmasi terima pembayaran [BURUH]' })
  confirmPayment(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.svc.workerConfirmPayment(id, req.user.userId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Batalkan transaksi' })
  cancel(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.svc.cancel(id, req.user.userId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Riwayat transaksi pengguna yang login' })
  myTransactions(@Request() req: any) {
    return this.svc.findByUser(req.user.userId, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail satu transaksi' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }
}
