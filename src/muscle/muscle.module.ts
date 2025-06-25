import { Module } from '@nestjs/common';
import { MuscleService } from './muscle.service';
import { MuscleController } from './muscle.controller';
import { PrismaService } from 'src/common/prisma.service';

@Module({
  controllers: [MuscleController],
  providers: [MuscleService, PrismaService],
})
export class MuscleModule {}
