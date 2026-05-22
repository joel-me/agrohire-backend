import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrasi pengguna baru (petani / buruh)' })
  @ApiBody({
    schema: {
      example: {
        username: 'pak_budi',
        email: 'budi@email.com',
        password: 'demo123',
        role: 'petani',
        fullName: 'Budi Santoso',
        phone: '081200000000',
      },
    },
  })
  register(@Body() dto: any) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login dan dapatkan JWT token' })
  @ApiBody({
    schema: {
      example: { email: 'petani@demo.com', password: 'demo123' },
    },
  })
  login(@Body() dto: any) {
    return this.authService.login(dto);
  }
}
