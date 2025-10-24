// src/owner/owner.module.ts

// Nest js
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

// Service
import { OwnerService } from './owner.service';

// Models
import { Owner } from './models/owner-model';

@Module({
  imports: [SequelizeModule.forFeature([Owner])],
  providers: [OwnerService],
  exports: [OwnerService],
})
export class OwnerModule {}

