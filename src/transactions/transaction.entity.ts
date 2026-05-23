import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'listing_id', unsigned: true })
  listingId: number;

  @Column({ name: 'farmer_id', unsigned: true })
  farmerId: number;

  @Column({ name: 'worker_id', unsigned: true })
  workerId: number;

  @ManyToOne(() => Listing)
  @JoinColumn({ name: 'listing_id' })
  listing: Listing;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'farmer_id' })
  farmer: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'worker_id' })
  worker: User;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  // Status alur: pending → work_started → work_completed → payment_pending → paid → done
  @Column({
    type: 'enum',
    enum: ['pending', 'work_started', 'work_completed', 'payment_pending', 'paid', 'done', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Column({ name: 'work_start_date', type: 'date', nullable: true })
  workStartDate: string;

  @Column({ name: 'work_end_date', type: 'date', nullable: true })
  workEndDate: string;

  @Column({ name: 'payment_method', nullable: true, length: 100 })
  paymentMethod: string;

  @Column({ name: 'payment_proof', nullable: true, length: 500 })
  paymentProof: string;

  @Column({ name: 'worker_confirmed_at', type: 'timestamp', nullable: true })
  workerConfirmedAt: Date;

  @Column({ name: 'farmer_verified_at', type: 'timestamp', nullable: true })
  farmerVerifiedAt: Date;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
