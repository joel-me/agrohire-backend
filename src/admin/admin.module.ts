import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';
import { Transaction } from '../transactions/transaction.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Listing, Transaction]), AuthModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
