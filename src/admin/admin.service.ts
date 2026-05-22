import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';
import { Transaction } from '../transactions/transaction.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)        private userRepo: Repository<User>,
    @InjectRepository(Listing)     private listingRepo: Repository<Listing>,
    @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
  ) {}

  getAllUsers() {
    return this.userRepo.find({ relations: ['profile'], order: { createdAt: 'DESC' } });
  }

  getAllListings() {
    return this.listingRepo.find({
      relations: ['farmer', 'farmer.profile'],
      order: { createdAt: 'DESC' },
    });
  }

  getAllTransactions() {
    return this.txRepo.find({
      relations: ['listing', 'farmer', 'farmer.profile', 'worker', 'worker.profile'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStats() {
    const [totalUsers, totalListings, totalTransactions] = await Promise.all([
      this.userRepo.count(),
      this.listingRepo.count(),
      this.txRepo.count(),
    ]);
    const totalPetani  = await this.userRepo.count({ where: { role: 'petani' } });
    const totalBuruh   = await this.userRepo.count({ where: { role: 'buruh' } });
    const openListings = await this.listingRepo.count({ where: { status: 'open' } });
    const releasedTx   = await this.txRepo.count({ where: { status: 'released' } });

    return { totalUsers, totalPetani, totalBuruh, totalListings, openListings, totalTransactions, releasedTx };
  }

  async deactivateUser(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    user.isActive = false;
    return this.userRepo.save(user);
  }

  async verifyUser(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    user.isVerified = true;
    return this.userRepo.save(user);
  }
}
