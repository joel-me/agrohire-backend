import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('listings')
export class Listing {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'farmer_id', unsigned: true })
  farmerId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'farmer_id' })
  farmer: User;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 200 })
  location: string;

  @Column({ nullable: true, length: 100 })
  city: string;

  @Column({ nullable: true, length: 100 })
  province: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ name: 'duration_days', unsigned: true })
  durationDays: number;

  @Column({ name: 'job_type', nullable: true, length: 100 })
  jobType: string;

  @Column({ name: 'required_workers', unsigned: true, default: 1 })
  requiredWorkers: number;

  @Column({ name: 'daily_wage', type: 'decimal', precision: 12, scale: 2 })
  dailyWage: number;

  @Column({ name: 'required_skills', type: 'json', nullable: true })
  requiredSkills: string[];

  @Column({ type: 'enum', enum: ['open', 'in_progress', 'completed', 'cancelled'], default: 'open' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
