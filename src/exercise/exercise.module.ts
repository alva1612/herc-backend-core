import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseController } from './infraestructure/exercise.controller';
import { PrismaService } from 'src/common/prisma.service';

@Module({
  controllers: [ExerciseController],
  providers: [ExerciseService, PrismaService],
})
export class ExerciseModule {}
