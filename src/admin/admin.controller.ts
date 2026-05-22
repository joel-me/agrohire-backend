import { Controller, Get, Patch, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private svc: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Semua pengguna [ADMIN]' })
  getAllUsers() { return this.svc.getAllUsers(); }

  @Get('listings')
  @ApiOperation({ summary: 'Semua listing [ADMIN]' })
  getAllListings() { return this.svc.getAllListings(); }

  @Get('transactions')
  @ApiOperation({ summary: 'Semua transaksi [ADMIN]' })
  getAllTransactions() { return this.svc.getAllTransactions(); }

  @Get('stats')
  @ApiOperation({ summary: 'Statistik dashboard [ADMIN]' })
  getStats() { return this.svc.getStats(); }

  @Patch('users/:id/deactivate')
  @ApiOperation({ summary: 'Nonaktifkan pengguna [ADMIN]' })
  deactivate(@Param('id', ParseIntPipe) id: number) { return this.svc.deactivateUser(id); }

  @Patch('users/:id/verify')
  @ApiOperation({ summary: 'Verifikasi pengguna [ADMIN]' })
  verify(@Param('id', ParseIntPipe) id: number) { return this.svc.verifyUser(id); }
}
