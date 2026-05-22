import { Controller, Get, Post, Patch, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
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

  @Post('start/:applicationId')
  @UseGuards(RolesGuard)
  @Roles('petani')
  @ApiOperation({ summary: 'Mulai transaksi escrow setelah petani pilih buruh [PETANI]' })
  start(@Param('applicationId', ParseIntPipe) appId: number, @Request() req: any) {
    return this.svc.createFromApplication(appId, req.user.userId);
  }

  @Patch(':id/worker-confirm')
  @UseGuards(RolesGuard)
  @Roles('buruh')
  @ApiOperation({ summary: 'Buruh konfirmasi pekerjaan selesai [BURUH]' })
  workerConfirm(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.svc.workerConfirm(id, req.user.userId);
  }

  @Patch(':id/farmer-verify')
  @UseGuards(RolesGuard)
  @Roles('petani')
  @ApiOperation({ summary: 'Petani verifikasi → dana escrow dilepas ke buruh [PETANI]' })
  farmerVerify(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.svc.farmerVerify(id, req.user.userId);
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
