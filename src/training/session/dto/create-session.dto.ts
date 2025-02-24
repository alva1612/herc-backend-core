import { Prisma } from '@prisma/client';
import { PrismaUtils } from 'src/common/prisma.utils';

export class CreateSessionTempDto {
  repetitions: number;
  weight: number;

  exercise: {
    id: number
    uuid: string
  }
  sessionGroup: {
    id: number
    uuid: string
  }
  dateRegistered: Date
  constructor(createPayload) {
    this.repetitions = createPayload.repetitions;
    this.weight = createPayload.weight;
    this.exercise = createPayload.exercise
    this.sessionGroup = createPayload.sessionGroup
    this.dateRegistered = new Date()
  }

  getDto(): Prisma.ExerciseOnTrainingSessionsTempCreateArgs['data'] {
    return {
      repetitions: this.repetitions,
      weight: this.weight,
      dateRegistered: this.dateRegistered,
      exercise: {
        connect: PrismaUtils.getEitherUniqueField(this.exercise)
      },
      trainingSessionGroupTemp: {
        connect: PrismaUtils.getEitherUniqueField(this.sessionGroup)
      },
    };
  }
}

export class CreateSessionGroupDto {
  trainingSets: { repetitions: number, weight: string, dateRegistered: string, exerciseUuid: string }[];
  trainingSetUuids: { uuid: string }[]
  dateStart: string

  constructor(dto: Partial<CreateSessionGroupDto>) {
    this.trainingSets = dto.trainingSets;
    this.trainingSetUuids = dto.trainingSetUuids
    this.dateStart = dto.dateStart
  }

  getDto(): Prisma.TrainingSessionGroupTempCreateInput {
    return {
      trainingSets: {
        connect: this.trainingSetUuids,
        create: this.trainingSets.map(v => ({ ...v, exercise: { connect: { uuid: v.exerciseUuid } } }))
      },
      dateStart: this.dateStart
    }
  }
}