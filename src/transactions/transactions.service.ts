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

  // STEP 1: Petani mulai transaksi setelah pilih buruh
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

    const tx = this.repo.create({
      listingId: listing.id,
      farmerId,
      workerId: app.workerId,
      amount,
      status: 'work_started',
      workStartDate: listing.startDate,
      workEndDate: listing.endDate,
    });

    await this.listingRepo.update(listing.id, { status: 'in_progress' });
    return this.repo.save(tx);
  }

  // STEP 2: Buruh konfirmasi pekerjaan selesai
  async workerConfirm(id: number, workerId: number) {
    const tx = await this.repo.findOne({ where: { id } });
    if (!tx) throw new NotFoundException('Transaksi tidak ditemukan');
    if (tx.workerId !== workerId) throw new ForbiddenException('Bukan transaksi Anda');
    if (tx.status !== 'work_started') throw new ForbiddenException('Pekerjaan belum dimulai');
    tx.status = 'work_completed';
    tx.workerConfirmedAt = new Date();
    return this.repo.save(tx);
  }

  // STEP 3: Petani verifikasi pekerjaan selesai → status jadi payment_pending
  async farmerVerify(id: number, farmerId: number) {
    const tx = await this.repo.findOne({ where: { id } });
    if (!tx) throw new NotFoundException('Transaksi tidak ditemukan');
    if (tx.farmerId !== farmerId) throw new ForbiddenException('Bukan transaksi Anda');
    if (tx.status !== 'work_completed') throw new ForbiddenException('Buruh belum konfirmasi selesai');
    tx.status = 'payment_pending';
    tx.farmerVerifiedAt = new Date();
    return this.repo.save(tx);
  }

  // STEP 4: Petani bayar upah ke buruh
  async farmerPay(id: number, farmerId: number, dto: { paymentMethod: string; paymentProof?: string }) {
    const tx = await this.repo.findOne({ where: { id }, relations: ['listing'] });
    if (!tx) throw new NotFoundException('Transaksi tidak ditemukan');
    if (tx.farmerId !== farmerId) throw new ForbiddenException('Bukan transaksi Anda');
    if (tx.status !== 'payment_pending') throw new ForbiddenException('Pekerjaan belum diverifikasi selesai');
    tx.status = 'paid';
    tx.paymentMethod = dto.paymentMethod;
    tx.paymentProof = dto.paymentProof || null;
    tx.paidAt = new Date();
    return this.repo.save(tx);
  }

  // STEP 5: Buruh konfirmasi terima pembayaran → selesai
  async workerConfirmPayment(id: number, workerId: number) {
    const tx = await this.repo.findOne({ where: { id }, relations: ['listing'] });
    if (!tx) throw new NotFoundException('Transaksi tidak ditemukan');
    if (tx.workerId !== workerId) throw new ForbiddenException('Bukan transaksi Anda');
    if (tx.status !== 'paid') throw new ForbiddenException('Petani belum melakukan pembayaran');
    tx.status = 'done';
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

  async cancel(id: number, userId: number) {
    const tx = await this.repo.findOne({ where: { id } });
    if (!tx) throw new NotFoundException('Transaksi tidak ditemukan');
    if (tx.farmerId !== userId && tx.workerId !== userId) throw new ForbiddenException('Bukan transaksi Anda');
    if (!['pending', 'work_started'].includes(tx.status)) throw new ForbiddenException('Tidak dapat dibatalkan');
    tx.status = 'cancelled';
    return this.repo.save(tx);
  }
}
