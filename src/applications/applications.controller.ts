import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApplicationsService } from './applications.service';

@ApiTags('Applications')
@Controller('applications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApplicationsController {
  constructor(private svc: ApplicationsService) {}

  @Post('listing/:listingId')
  @UseGuards(RolesGuard)
  @Roles('buruh')
  @ApiOperation({ summary: 'Buruh melamar listing pekerjaan [BURUH]' })
  apply(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Request() req: any,
    @Body('coverNote') coverNote?: string,
  ) {
    return this.svc.apply(listingId, req.user.userId, coverNote);
  }

  @Get('listing/:listingId')
  @UseGuards(RolesGuard)
  @Roles('petani')
  @ApiOperation({ summary: 'Petani melihat daftar pelamar [PETANI]' })
  getApplicants(@Param('listingId', ParseIntPipe) listingId: number, @Request() req: any) {
    return this.svc.getApplicants(listingId, req.user.userId);
  }

  @Patch(':id/accept')
  @UseGuards(RolesGuard)
  @Roles('petani')
  @ApiOperation({ summary: 'Petani menerima pelamar [PETANI]' })
  accept(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.svc.updateStatus(id, 'accepted', req.user.userId);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles('petani')
  @ApiOperation({ summary: 'Petani menolak pelamar [PETANI]' })
  reject(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.svc.updateStatus(id, 'rejected', req.user.userId);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles('buruh')
  @ApiOperation({ summary: 'Buruh melihat semua lamarannya [BURUH]' })
  myApplications(@Request() req: any) {
    return this.svc.getByWorker(req.user.userId);
  }
}
