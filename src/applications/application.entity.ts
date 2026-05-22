import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'listing_id', unsigned: true })
  listingId: number;

  @Column({ name: 'worker_id', unsigned: true })
  workerId: number;

  @ManyToOne(() => Listing)
  @JoinColumn({ name: 'listing_id' })
  listing: Listing;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'worker_id' })
  worker: User;

  @Column({ name: 'cover_note', type: 'text', nullable: true })
  coverNote: string;

  @Column({ type: 'enum', enum: ['pending', 'accepted', 'rejected', 'withdrawn'], default: 'pending' })
  status: string;

  @CreateDateColumn({ name: 'applied_at' })
  appliedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
