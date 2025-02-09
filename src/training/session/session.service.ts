import { Injectable } from '@nestjs/common';
import { CreateSessionTempDto } from './dto/create-session.dto';
import { PrismaService } from 'src/common/prisma.service';
import { Prisma } from '@prisma/client';
import { ListSessionDto, ListSessionsCustomFilters } from './dto/list-session.dto';

@Injectable()
export class SessionService {

  constructor(private clientService: PrismaService) { }

  async create(createSessionDto: CreateSessionTempDto) {
    const client = this.clientService.getClient();

    const result = await client.exerciseOnTrainingSessionsTemp.create({
      data: createSessionDto.getDto()
    });

    return result;
  }

  async findAll({ filters, customFilters }: ListSessionDto) {
    const client = this.clientService.getClient();
    const whereCondition = this.parseCustomFilters(filters, customFilters);

    const data = await client.exerciseOnTrainingSessionsTemp.findMany({
      select: {
        dateRegistered: true,
        uuid: true,
        weight: true,
        exercise: {
          select: {
            uuid: true,
            name: true,
            description: true
          }
        },
        repetitions: true
      },
      orderBy: {
        dateRegistered: "desc",
      },
      where: whereCondition
    })
    const total = await client.exerciseOnTrainingSessionsTemp.count({
      where: whereCondition
    })

    return {
      data: data.map((x) => {
        const rawDate = new Date(x.dateRegistered);
        const hours = rawDate.getHours();
        rawDate.setHours(hours - 5);
        return {
          ...x,
          dateRegistered: rawDate.toISOString()
        }

      }),
      total
    }
  }

  async findLastSessionByExercise(exerciseUuid: string) {
    const client = this.clientService.getClient();
    const result = await client.exerciseOnTrainingSessionsTemp.findFirst({
      select: {
        exercise: {
          select: {
            name: true
          }
        },
        uuid: true,
        repetitions: true,
        weight: true,
        dateRegistered: true
      },
      where: {
        exercise: {
          uuid: exerciseUuid
        }
      },
      orderBy: {
        dateRegistered: 'desc'
      },
      take: 1
    })

    return {
      data: result
    };
  }

  parseCustomFilters(baseFilters: Prisma.ExerciseOnTrainingSessionsTempFindManyArgs['where'], customFilter: ListSessionsCustomFilters): Prisma.ExerciseOnTrainingSessionsTempFindManyArgs['where'] {
    switch (customFilter) {
      case 'today':
        const today = new Date()
        today.setHours(0, 0, 0)
        return {
          ...baseFilters,
          dateRegistered: {
            gte: today
          }
        }
      default:
        return baseFilters;
    }

  }
}
