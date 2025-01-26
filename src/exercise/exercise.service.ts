import { Injectable } from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { PrismaService } from 'src/common/prisma.service';
import { Prisma } from '@prisma/client';

type FindManyArgs = {
  filters: Prisma.ExerciseFindManyArgs['where']
}

@Injectable()
export class ExerciseService {

  constructor(private readonly clientService: PrismaService) { }

  create(createExerciseDto: CreateExerciseDto) {
    const client = this.clientService.getClient();
    return client.exercise.create({ data: createExerciseDto })
  }

  async findAll(where: FindManyArgs['filters']) {
    const data = await this.clientService.getClient().exercise.findMany({
      select: {
        uuid: true,
        name: true,
        description: true
      },
      where,
    });

    const total = await this.clientService.getClient().exercise.count({
      where
    });

    return {
      data,
      total
    }
  }
}
