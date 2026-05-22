import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ListingsService } from './listings.service';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
  constructor(private svc: ListingsService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar lowongan terbuka (filter: city, job_type, min_wage)' })
  findAll(@Query() query: any) {
    return this.svc.findAll(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('petani')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lowongan milik petani yang sedang login' })
  myListings(@Request() req: any) {
    return this.svc.findByFarmer(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail satu lowongan' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('petani')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buat lowongan baru [PETANI]' })
  create(@Request() req: any, @Body() dto: any) {
    return this.svc.create(req.user.userId, dto);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('petani')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Batalkan lowongan [PETANI]' })
  cancel(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.svc.cancel(id, req.user.userId);
  }
}
