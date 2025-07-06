import { Injectable } from '@nestjs/common';
import { CreateSessionGroupDto, CreateSessionTempDto } from './dto/create-session.dto';
import { PrismaService } from 'src/common/prisma.service';
import { Prisma } from '@prisma/client';
import { ListSetDto, ListSessionsCustomFilters, ListSessionDto } from './dto/list-session.dto';
import { getFile } from 'src/migrations/v1ToV2';
import { join } from 'node:path';
import { Decimal } from '@prisma/client/runtime/library';

const SECOND_VALUE = 1000
const MINUTE_VALUE = SECOND_VALUE * 60
const HOUR_VALUE = MINUTE_VALUE * 60

@Injectable()
export class SessionService {

  constructor(private clientService: PrismaService) { }

  async createSetSmart(createSessionDto: CreateSessionTempDto) {
    if (createSessionDto.sessionGroup) {
      return this.createSet(createSessionDto);
    }
    const client = this.clientService.getClient();
    const dateGT = new Date(new Date().valueOf() - 15 * MINUTE_VALUE);
    const closeSessionUuid = await client.exerciseOnTrainingSessions.findFirst({
      select: {
        trainingSessionGroup: {
          select: {
            uuid: true
          }
        }
      },
      where: {
        dateRegistered: {
          gt: dateGT
        }
      }
    })
    if (closeSessionUuid?.trainingSessionGroup.uuid) {
      createSessionDto.setSessionGroup({ uuid: closeSessionUuid.trainingSessionGroup.uuid })
    } else {
      const sessionGroup = await this.createSessionGroup(new CreateSessionGroupDto({ trainingSetUuids: [], dateStart: new Date().toISOString() }));
      createSessionDto.setSessionGroup({ uuid: sessionGroup.uuid })
    }
    return this.createSet(createSessionDto);
  }

  async createSessionGroup(createSessionGroupDto: CreateSessionGroupDto) {
    const client = this.clientService.getClient();
    return client.trainingSessionGroup.create({
      data: createSessionGroupDto.getDto()
    })
  }

  async findAllSets({ filters, customFilters }: ListSetDto) {
    const client = this.clientService.getClient();
    const whereCondition = this.parseCustomFilters(filters, customFilters);

    const data = await client.exerciseOnTrainingSessions.findMany({
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
    const total = await client.exerciseOnTrainingSessions.count({
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

    const data = await client.trainingSessionGroup.findMany({
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
    const total = await client.trainingSessionGroup.count({
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
    const where: Prisma.ExerciseOnTrainingSessionsWhereInput = {
      exercise: {
        uuid: exerciseUuid
      },
    }
    if (excludedSessionGroupUuid) {
      where.trainingSessionGroup = {
        isNot: {
          uuid: excludedSessionGroupUuid
        }
      }
    }
    const resultSessionGroup = await client.trainingSessionGroup.findFirst({
      select: {
        uuid: true,
      },
      where: {
        trainingSets: {
          some: {
            exercise: {
              uuid: {
                equals: exerciseUuid
              }
            }
          }
        }
      },
      orderBy: {
        dateEnd: 'desc'
      },
      take: 1
    })

    if (!resultSessionGroup) {
      return null;
    }

    const resultSession = await client.exerciseOnTrainingSessions.findMany({
      where: {
        trainingSessionGroup: {
          uuid: {
            equals: resultSessionGroup.uuid
          }
        },
        exercise: {
          uuid: {
            equals: exerciseUuid
          }
        }
      }
    })

    console.log({ resultSession, resultSessionGroup })

    const estimatedOverload = resultSession.reduce<{ maxWeight: Decimal, maxReps: number }>((acc, curr) => {
      const maxWeight = curr.weight.greaterThan(acc.maxWeight) ? curr.weight : acc.maxWeight;
      const maxReps = curr.repetitions > acc.maxReps ? curr.repetitions : acc.maxReps;
      return {
        maxWeight,
        maxReps,
      }
    }, { maxWeight: new Decimal(0), maxReps: 0 });

    return {
      data: estimatedOverload
    };
  }

  parseCustomFilters(baseFilters: Prisma.ExerciseOnTrainingSessionsFindManyArgs['where'], customFilter: ListSessionsCustomFilters): Prisma.ExerciseOnTrainingSessionsFindManyArgs['where'] {
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

  parseCustomFilterGroups(baseFilters: Prisma.TrainingSessionGroupFindManyArgs['where'], customFilter: ListSessionsCustomFilters): Prisma.TrainingSessionGroupFindManyArgs['where'] {
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
    const client = this.clientService.getClient();
    const name = 'v1Tov2';
    const pathToFolder = join(__dirname, '..', '..', '..', 'migrations', 'csv');
    const exerciseData = await getFile(join(pathToFolder, `${name}_exercises.csv`)) as { id: number, uuid: string, name: string, description: string }[];
    await client.exercise.createMany({ data: exerciseData.map((e) => ({ id: Number(e.id), uuid: e.uuid, name: e.name, description: e.description })) });

    const data = await getFile(join(pathToFolder, `${name}_sessionGroups.csv`)) as { dateRegistered: string, exerciseId: string }[];

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

    await client.exerciseOnTrainingSessions.deleteMany({ where: {} })
    await client.trainingSessionGroup.deleteMany({
      where: {},
    });
    const promises = sessionGroups.map(async (group) => {
      const dbGroup = await client.trainingSessionGroup.create({
        select: {
          uuid: true,
        },
        data: new CreateSessionGroupDto({ trainingSets: [], dateStart: new Date().toISOString() }).getDto()
      })

      const dbSeries = group.map(series => {
        const dto = new CreateSessionTempDto({
          repetitions: Number(series.repetitions),
          weight: series.weight,
          exercise: {
            id: Number(series.exerciseId)
          },
          sessionGroup: {
            uuid: dbGroup.uuid
          }
        });
        return this.createSet(dto);
      })
      const createdSeries = await Promise.all(dbSeries);
      return createdSeries;
    })
    const result = await Promise.all(promises)
    return result;
  }

  private async createSet(createSetDto: CreateSessionTempDto) {
    const client = this.clientService.getClient();
    const result = await client.exerciseOnTrainingSessions.create({
      data: createSetDto.getDto()
    });

    return result;
  }
}

