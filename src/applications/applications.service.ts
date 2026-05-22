import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './application.entity';
import { Listing } from '../listings/listing.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application) private repo: Repository<Application>,
    @InjectRepository(Listing)     private listingRepo: Repository<Listing>,
  ) {}

  async apply(listingId: number, workerId: number, coverNote?: string) {
    const listing = await this.listingRepo.findOne({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Lowongan tidak ditemukan');
    if (listing.status !== 'open') throw new ForbiddenException('Lowongan sudah tidak tersedia');

    const exists = await this.repo.findOne({ where: { listingId, workerId } });
    if (exists) throw new ConflictException('Anda sudah melamar pekerjaan ini');

    const app = this.repo.create({ listingId, workerId, coverNote, status: 'pending' });
    return this.repo.save(app);
  }

  async getApplicants(listingId: number, farmerId: number) {
    const listing = await this.listingRepo.findOne({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Lowongan tidak ditemukan');
    if (listing.farmerId !== farmerId) throw new ForbiddenException('Bukan lowongan Anda');

    return this.repo.find({
      where: { listingId },
      relations: ['worker', 'worker.profile'],
      order: { appliedAt: 'DESC' },
    });
  }

  async updateStatus(id: number, status: string, farmerId: number) {
    const app = await this.repo.findOne({ where: { id }, relations: ['listing'] });
    if (!app) throw new NotFoundException('Lamaran tidak ditemukan');
    if (app.listing.farmerId !== farmerId) throw new ForbiddenException('Bukan wewenang Anda');
    app.status = status;
    return this.repo.save(app);
  }

  async getByWorker(workerId: number) {
    return this.repo.find({
      where: { workerId },
      relations: ['listing', 'listing.farmer', 'listing.farmer.profile'],
      order: { appliedAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const app = await this.repo.findOne({ where: { id }, relations: ['listing', 'worker'] });
    if (!app) throw new NotFoundException('Lamaran tidak ditemukan');
    return app;
  }
}
