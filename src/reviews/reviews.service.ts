import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { Transaction } from '../transactions/transaction.entity';
import { Profile } from '../users/profile.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)      private repo: Repository<Review>,
    @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
    @InjectRepository(Profile)     private profileRepo: Repository<Profile>,
  ) {}

  async create(transactionId: number, reviewerId: number, dto: any) {
    const tx = await this.txRepo.findOne({ where: { id: transactionId } });
    if (!tx) throw new NotFoundException('Transaksi tidak ditemukan');
    if (tx.status !== 'released') throw new ForbiddenException('Transaksi belum selesai');
    if (tx.farmerId !== reviewerId && tx.workerId !== reviewerId)
      throw new ForbiddenException('Bukan transaksi Anda');

    const exists = await this.repo.findOne({ where: { transactionId, reviewerId } });
    if (exists) throw new ConflictException('Anda sudah memberi rating untuk transaksi ini');

    const revieweeId = tx.farmerId === reviewerId ? tx.workerId : tx.farmerId;
    const review = this.repo.create({ transactionId, reviewerId, revieweeId, ...dto });
    const saved = await this.repo.save(review);

    // Update avg_rating di profil reviewee
    const reviews = await this.repo.find({ where: { revieweeId } });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await this.profileRepo.update({ userId: revieweeId }, {
      avgRating: Math.round(avg * 100) / 100,
      totalJobs: reviews.length,
    });

    return saved;
  }
}
