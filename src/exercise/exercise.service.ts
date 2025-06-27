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

    const hasMuscleSections = createExerciseDto.muscleSectionExercises?.length > 0

    const createExerciseData: Prisma.XOR<Prisma.ExerciseCreateInput, Prisma.ExerciseUncheckedCreateInput> = {
      name: createExerciseDto.name,
      description: createExerciseDto.description,
    }
    if (hasMuscleSections) {
      const orClause = createExerciseDto.muscleSectionExercises.map(me => PrismaUtils.getEitherUniqueFieldFromValue(me.muscleSectionId));
      const muscleIds = await client.muscleSections.findMany({
        select: {
          id: true,
          uuid: true
        },
        where: {
          OR: orClause
        }
      });
      createExerciseData.muscleSectionExercises = {
        createMany: {
          data: createExerciseDto.muscleSectionExercises.map(me => {
            return {
              description: me.description,
              effort: me.effort,
              muscleSectionId: muscleIds.find(e => me.muscleSectionId === e.id || me.muscleSectionId === e.uuid).id
            }
          })
        }
      }
    }

    return client.exercise.create({ data: createExerciseData })
  }

  async update(identifier: string | number, updateExerciseDto: UpdateExerciseDto) {
    const client = this.clientService.getClient();

    await client.muscleSectionExercises.deleteMany({
      where: {
        exercise: PrismaUtils.getEitherUniqueFieldFromValue(identifier)
      }
    })

    const updateMuscleSectionExercises: Prisma.XOR<Prisma.ExerciseUpdateInput, Prisma.ExerciseUncheckedUpdateInput> = {
      description: updateExerciseDto.description,
      name: updateExerciseDto.name
    }

    const hasMuscleSections = updateExerciseDto?.muscleSectionExercises.length > 0
    if (hasMuscleSections) {
      const orClause = updateExerciseDto.muscleSectionExercises.map(me => PrismaUtils.getEitherUniqueFieldFromValue(me.muscleSectionId));
      const muscleIds = await client.muscleSections.findMany({
        select: {
          id: true,
          uuid: true
        },
        where: {
          OR: orClause
        }
      });
      updateMuscleSectionExercises.muscleSectionExercises = {
        createMany: {
          data: updateExerciseDto.muscleSectionExercises.map(me => {
            return {
              description: me.description,
              effort: me.effort,
              muscleSectionId: muscleIds.find(e => me.muscleSectionId === e.id || me.muscleSectionId === e.uuid).id
            }
          })
        }
      }
    }
    return client.exercise.update({
      data: updateMuscleSectionExercises, where: PrismaUtils.getEitherUniqueFieldFromValue(identifier), include: {
        muscleSectionExercises: hasMuscleSections
      }
    })
  }

  async findAll(where: FindManyArgs['filters'], customFilters: { muscleSection: string[] }) {

    const customFilter = this.handleFilters(customFilters);
    const whereObj = customFilter ?? where;
    const data = await this.clientService.getClient().exercise.findMany({
      select: {
        uuid: true,
        name: true,
        description: true
      },
      where: whereObj,
    });

    const total = await this.clientService.getClient().exercise.count({
      where: whereObj
    });

    return {
      data,
      total
    }
  }

  private handleFilters(customFilters): FindManyArgs['filters'] {
    if (customFilters.muscleSection)
      return {
        muscleSectionExercises: {
          some: {
            muscleSection: {
              uuid: {
                in: customFilters.muscleSection
              }
            }
          }
        }
      }
  }
}
