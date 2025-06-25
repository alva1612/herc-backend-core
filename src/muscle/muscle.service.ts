import { Injectable } from '@nestjs/common';
import { CreateMuscleDto } from './dto/create-muscle.dto';
import { UpdateMuscleDto } from './dto/update-muscle.dto';
import { PrismaService } from 'src/common/prisma.service';
import { PrismaUtils } from 'src/common/prisma.utils';

@Injectable()
export class MuscleService {

  constructor(private readonly clientService: PrismaService) { }

  async create(createMuscleDto: CreateMuscleDto) {
    const client = this.clientService.getClient();

    const exerciseIds = createMuscleDto.muscleExercises?.length > 0 ? await client.exercise.findMany({
      select: {
        id: true,
        uuid: true
      },
      where: {
        OR: createMuscleDto.muscleExercises.map(me => PrismaUtils.getEitherUniqueFieldFromValue(me.exerciseId))
      }
    }) : null;
    const muscleSectionExercisesObj = createMuscleDto.muscleExercises?.length > 0 ? {
      createMany: {
        data: createMuscleDto.muscleExercises.map(me => {
          return {
            description: me.description,
            effort: me.effort,
            exerciseId: exerciseIds.find(e => me.exerciseId === e.id || me.exerciseId === e.uuid).id
          }
        })
      }
    } : {}

    return client.muscleSections.create({
      data: {
        name: createMuscleDto.name,
        description: createMuscleDto.description,
        muscleSectionExercises: muscleSectionExercisesObj
      }
    })
  }

  findAll() {
    const client = this.clientService.getClient();
    return client.muscleSections.findMany({
      select: {
        uuid: true,
        name: true,
        description: true,
        muscleSectionExercises: {
          select: {
            exercise: {
              omit: {
                id: true
              }
            },
            effort: true,
            description: true
          }
        }
      }
    })
  }

  findOne(id: number) {
    return `This action returns a #${id} muscle`;
  }

  update(id: number, updateMuscleDto: UpdateMuscleDto) {
    return `This action updates a #${id} muscle`;
  }

  remove(id: number) {
    return `This action removes a #${id} muscle`;
  }
}
