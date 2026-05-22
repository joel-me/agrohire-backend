import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private repo: Repository<Notification>) {}

  async findByUser(userId: number) {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number, userId: number) {
    await this.repo.update({ id, userId }, { isRead: true });
    return { message: 'Notifikasi ditandai sudah dibaca' };
  }

  async markAllAsRead(userId: number) {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
    return { message: 'Semua notifikasi ditandai sudah dibaca' };
  }

  async create(userId: number, type: string, title: string, message: string, refId?: number, refType?: string) {
    const notif = this.repo.create({ userId, type, title, message, refId, refType });
    return this.repo.save(notif);
  }
}
