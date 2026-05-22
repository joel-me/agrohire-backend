import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'user_id', unsigned: true })
  userId: number;

  @OneToOne(() => User, (u) => u.profile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true, length: 100 })
  city: string;

  @Column({ nullable: true, length: 100 })
  province: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'avatar_url', nullable: true, length: 500 })
  avatarUrl: string;

  @Column({ type: 'json', nullable: true })
  skills: string[];

  @Column({ name: 'experience_years', unsigned: true, default: 0 })
  experienceYears: number;

  @Column({ name: 'avg_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  avgRating: number;

  @Column({ name: 'total_jobs', unsigned: true, default: 0 })
  totalJobs: number;

  @Column({ name: 'farm_name', nullable: true, length: 100 })
  farmName: string;

  @Column({ name: 'farm_size', type: 'decimal', precision: 10, scale: 2, nullable: true })
  farmSize: number;

  @Column({ name: 'farm_type', nullable: true, length: 100 })
  farmType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
