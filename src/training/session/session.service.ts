import { Injectable } from '@nestjs/common';
import { CreateSessionGroupDto, CreateSessionTempDto } from './dto/create-session.dto';
import { PrismaService } from 'src/common/prisma.service';
import { Prisma } from '@prisma/client';
import { ListSetDto, ListSessionsCustomFilters, ListSessionDto } from './dto/list-session.dto';
import { getFile } from 'src/migrations/v1ToV2';

const SECOND_VALUE = 1000
const MINUTE_VALUE = SECOND_VALUE * 60
const HOUR_VALUE = MINUTE_VALUE * 60

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

  async createSessionGroup(createSessionGroupDto: CreateSessionGroupDto) {
    const client = this.clientService.getClient();
    return client.trainingSessionGroupTemp.create({
      data: createSessionGroupDto.getDto()
    })
  }

  async findAllSets({ filters, customFilters }: ListSetDto) {
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

  async findAll({ filters, customFilters }: ListSessionDto) {
    const client = this.clientService.getClient();
    const whereCondition = this.parseCustomFilterGroups(filters, customFilters);

    const data = await client.trainingSessionGroupTemp.findMany({
      include: {
        trainingSets: {
          include: {
            exercise: true
          }
        }
      },
      orderBy: {
        dateStart: "desc",
      },
      where: whereCondition
    })
    const total = await client.trainingSessionGroupTemp.count({
      where: whereCondition
    })

    return {
      data: data.map((x) => {
        const rawDate = new Date(x.dateStart);
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

  async findLastSessionByExercise(exerciseUuid: string, excludedSessionGroupUuid?: string) {
    const client = this.clientService.getClient();
    const where: Prisma.ExerciseOnTrainingSessionsTempWhereInput = {
      exercise: {
        uuid: exerciseUuid
      },
    }
    if (excludedSessionGroupUuid) {
      where.trainingSessionGroupTemp = {
        isNot: {
          uuid: excludedSessionGroupUuid
        }
      } 
    }
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
      where,
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
        const today = new Date().setHours(0, 0, 0).valueOf();
        // ajuste por utc -5
        const toBogotaVal = today - 5 * HOUR_VALUE;
        const toBogota = new Date(toBogotaVal);
        return {
          ...baseFilters,
          dateRegistered: {
            gte: toBogota
          }
        }
      default:
        return baseFilters;
    }

  }

  parseCustomFilterGroups(baseFilters: Prisma.TrainingSessionGroupTempFindManyArgs['where'], customFilter: ListSessionsCustomFilters): Prisma.TrainingSessionGroupTempFindManyArgs['where'] {
    switch (customFilter) {
      case 'today':
        const today = new Date().setHours(0, 0, 0).valueOf();
        // ajuste por utc -5
        const toBogotaVal = today - 5 * HOUR_VALUE;
        const toBogota = new Date(toBogotaVal);
        return {
          ...baseFilters,
          dateStart: {
            gte: toBogota
          }
        }
      default:
        return baseFilters;
    }

  }

  async migrateFromCSV() {
    const data = await getFile() as { dateRegistered: string, exerciseId: string }[];

    const sessionGroups = data.reduce((acc, curr) => {
      const lastSession = acc.at(-1)
      const getDateValue = (date: string) => new Date(date).valueOf()
      const lastSeries = lastSession?.at(-1)

      const isNewSession = !acc[0] || Math.abs(getDateValue(lastSeries.dateRegistered) - getDateValue(curr.dateRegistered)) > MINUTE_VALUE * 15
      if (isNewSession) {
        return [...acc, [curr]]
      }
      const newLastSession = [...lastSession, curr]
      const newAcc = [...acc]
      newAcc[acc.length - 1] = newLastSession
      return newAcc
    }, [])
    const client = this.clientService.getClient()
    await client.exerciseOnTrainingSessionsTemp.deleteMany({where: {}})
    await client.trainingSessionGroupTemp.deleteMany({
      where: {},
    });
    const promises = sessionGroups.map(async (group) => {
      const dbGroup = await client.trainingSessionGroupTemp.create({
        select: {
          uuid: true,
        },
        data: new CreateSessionGroupDto({ trainingSetUuids: [] }).getDto()
      })

      const dbSeries = group.map(series => {
        return client.exerciseOnTrainingSessionsTemp.create({
          data: new CreateSessionTempDto({
            repetitions: Number(series.repetitions),
            weight: series.weight,
            exercise: {
              id: Number(series.exerciseId)
            },
            sessionGroup: {
              uuid: dbGroup.uuid
            }
          }).getDto()
        })
      })
      const createdSeries = await Promise.all(dbSeries);
      return createdSeries;
    })
    const result = await Promise.all(promises)
    return result;
  }
}

