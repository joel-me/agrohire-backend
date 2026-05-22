import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private svc: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Lihat profil sendiri' })
  getProfile(@Request() req: any) {
    return this.svc.getProfile(req.user.userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update profil sendiri' })
  updateProfile(@Request() req: any, @Body() dto: any) {
    return this.svc.updateProfile(req.user.userId, dto);
  }
}
