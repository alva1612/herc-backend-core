import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExerciseModule } from './exercise/exercise.module';
import { PlanModule } from './training/plan/plan.module';
import { SessionModule } from './training/session/session.module';
import { MuscleModule } from './muscle/muscle.module';

@Module({
  imports: [ExerciseModule, PlanModule, SessionModule, MuscleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
