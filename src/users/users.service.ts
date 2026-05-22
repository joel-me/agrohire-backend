import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Profile } from './profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)    private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
  ) {}

  async findById(id: number) {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['profile'] });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return user;
  }

  async getProfile(userId: number) {
    const user = await this.findById(userId);
    const { passwordHash, ...safe } = user as any;
    return safe;
  }

  async updateProfile(userId: number, dto: any) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile tidak ditemukan');
    Object.assign(profile, dto);
    return this.profileRepo.save(profile);
  }
}
