import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from './listing.entity';

@Injectable()
export class ListingsService {
  constructor(@InjectRepository(Listing) private repo: Repository<Listing>) {}

  async findAll(query: any) {
    const qb = this.repo.createQueryBuilder('l')
      .leftJoinAndSelect('l.farmer', 'u')
      .leftJoinAndSelect('u.profile', 'p')
      .where('l.status = :status', { status: 'open' })
      .orderBy('l.createdAt', 'DESC');

    if (query.city)     qb.andWhere('l.city LIKE :city', { city: `%${query.city}%` });
    if (query.job_type) qb.andWhere('l.jobType = :jt', { jt: query.job_type });
    if (query.min_wage) qb.andWhere('l.dailyWage >= :mw', { mw: +query.min_wage });

    return qb.getMany();
  }

  async findOne(id: number) {
    const listing = await this.repo.findOne({
      where: { id },
      relations: ['farmer', 'farmer.profile'],
    });
    if (!listing) throw new NotFoundException('Lowongan tidak ditemukan');
    return listing;
  }

  async findByFarmer(farmerId: number) {
    return this.repo.find({
      where: { farmerId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(farmerId: number, dto: any) {
    const listing = this.repo.create({ ...dto, farmerId });
    return this.repo.save(listing);
  }

  async cancel(id: number, farmerId: number) {
    const listing = await this.findOne(id);
    if (listing.farmerId !== farmerId) throw new ForbiddenException('Bukan milik Anda');
    if (listing.status !== 'open') throw new ForbiddenException('Tidak dapat membatalkan lowongan ini');
    listing.status = 'cancelled';
    return this.repo.save(listing);
  }
}
