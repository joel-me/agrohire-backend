import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Profile } from '../users/profile.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)    private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    private jwtService: JwtService,
  ) {}

  async register(dto: any) {
    const exists = await this.userRepo.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });
    if (exists) throw new ConflictException('Email atau username sudah digunakan');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      username: dto.username,
      email: dto.email,
      passwordHash: hash,
      role: dto.role || 'buruh',
    });
    await this.userRepo.save(user);

    const profile = this.profileRepo.create({
      userId: user.id,
      fullName: dto.fullName,
      phone: dto.phone || null,
    });
    await this.profileRepo.save(profile);

    const token = this.jwtService.sign({ sub: user.id, role: user.role });
    return {
      message: 'Registrasi berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: dto.fullName,
      },
    };
  }

  async login(dto: any) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      relations: ['profile'],
    });

    if (!user) throw new UnauthorizedException('Email atau password salah');
    if (!user.isActive) throw new UnauthorizedException('Akun nonaktif');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Email atau password salah');

    const token = this.jwtService.sign({ sub: user.id, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.profile?.fullName,
        avgRating: user.profile?.avgRating,
        totalJobs: user.profile?.totalJobs,
        isVerified: user.isVerified,
      },
    };
  }
}
