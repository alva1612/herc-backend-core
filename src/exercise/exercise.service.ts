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

  async create(createExerciseDto: CreateExerciseDto) {
    const client = this.clientService.getClient();

    const orClause = createExerciseDto.muscleExercises.map(me => PrismaUtils.getEitherUniqueFieldFromValue(me.muscleSectionId))
    const muscleIds = createExerciseDto.muscleExercises?.length > 0 ? await client.muscleSections.findMany({
      select: {
        id: true,
        uuid: true
      },
      where: {
        OR: orClause
      }
    }) : null;

    const muscleSectionExercisesObj = createExerciseDto.muscleExercises?.length > 0 ? {
      createMany: {
        data: createExerciseDto.muscleExercises.map(me => {
          return {
            description: me.description,
            effort: me.effort,
            muscleSectionId: muscleIds.find(e => me.muscleSectionId === e.id || me.muscleSectionId === e.uuid).id
          }
        })
      }
    } : {}
    delete createExerciseDto.muscleExercises
    return client.exercise.create({ data: {
      ...createExerciseDto,
      muscleSectionExercises: muscleSectionExercisesObj
    } })
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
