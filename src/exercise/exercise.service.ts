import { Injectable } from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { PrismaService } from 'src/common/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { PrismaUtils } from 'src/common/prisma.utils';

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

  patch(identifier: string | number, updateExerciseDto: UpdateExerciseDto) {
    const client = this.clientService.getClient();
    return client.exercise.update({ data: updateExerciseDto, where: PrismaUtils.getEitherUniqueFieldFromValue(identifier)})
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
