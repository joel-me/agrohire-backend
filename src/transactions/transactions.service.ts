import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { Application } from '../applications/application.entity';
import { Listing } from '../listings/listing.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private repo: Repository<Transaction>,
    @InjectRepository(Application) private appRepo: Repository<Application>,
    @InjectRepository(Listing)     private listingRepo: Repository<Listing>,
  ) {}

  async createFromApplication(applicationId: number, farmerId: number) {
    const app = await this.appRepo.findOne({
      where: { id: applicationId },
      relations: ['listing'],
    });
    if (!app) throw new NotFoundException('Lamaran tidak ditemukan');
    if (app.listing.farmerId !== farmerId) throw new ForbiddenException('Bukan wewenang Anda');
    if (app.status !== 'accepted') throw new ForbiddenException('Lamaran belum diterima');

    const listing = app.listing;
    const amount = listing.durationDays * listing.dailyWage;
    const platformFee = amount * 0.02; // 2% platform fee
    const netAmount = amount - platformFee;

    const tx = this.repo.create({
      listingId: listing.id,
      farmerId,
      workerId: app.workerId,
      amount,
      platformFee,
      netAmount,
      status: 'escrow_held',
      workStartDate: listing.startDate,
      workEndDate: listing.endDate,
    });

    await this.listingRepo.update(listing.id, { status: 'in_progress' });
    return this.repo.save(tx);
  }

  async workerConfirm(id: number, workerId: number) {
    const tx = await this.repo.findOne({ where: { id } });
    if (!tx) throw new NotFoundException('Transaksi tidak ditemukan');
    if (tx.workerId !== workerId) throw new ForbiddenException('Bukan transaksi Anda');
    tx.status = 'work_completed';
    tx.workerConfirmedAt = new Date();
    return this.repo.save(tx);
  }

  async farmerVerify(id: number, farmerId: number) {
    const tx = await this.repo.findOne({ where: { id }, relations: ['listing'] });
    if (!tx) throw new NotFoundException('Transaksi tidak ditemukan');
    if (tx.farmerId !== farmerId) throw new ForbiddenException('Bukan transaksi Anda');
    if (tx.status !== 'work_completed') throw new ForbiddenException('Buruh belum konfirmasi selesai');

    tx.status = 'released';
    tx.farmerVerifiedAt = new Date();
    await this.listingRepo.update(tx.listingId, { status: 'completed' });
    return this.repo.save(tx);
  }

  async findByUser(userId: number, role: string) {
    const where = role === 'petani' ? { farmerId: userId } : { workerId: userId };
    return this.repo.find({
      where,
      relations: ['listing', 'farmer', 'farmer.profile', 'worker', 'worker.profile'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const tx = await this.repo.findOne({
      where: { id },
      relations: ['listing', 'farmer', 'farmer.profile', 'worker', 'worker.profile'],
    });
    if (!tx) throw new NotFoundException('Transaksi tidak ditemukan');
    return tx;
  }
}
