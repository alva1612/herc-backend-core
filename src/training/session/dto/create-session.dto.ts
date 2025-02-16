import { Prisma } from '@prisma/client';

export class CreateSessionTempDto {
  repetitions: number;
  weight: number;

  exerciseId: number;
  exerciseUuid: string;
  constructor(createPayload) {
    this.repetitions = createPayload.repetitions;
    this.weight = createPayload.weight;
    this.exerciseId = createPayload.exerciseId;
    this.exerciseUuid = createPayload.exerciseUuid;
  }

  getDto(): Prisma.ExerciseOnTrainingSessionsTempCreateArgs['data'] {
    const dto = {
      repetitions: this.repetitions,
      weight: this.weight,
      dateRegistered: new Date(),
    };
    if (this.exerciseId) {
      return {
        ...dto,
        exercise: {
          connect: {
            id: this.exerciseId,
          },
        },
      };
    }
    if (this.exerciseUuid) {
      return {
        ...dto,
        exercise: {
          connect: {
            uuid: this.exerciseUuid,
          },
        },
      };
    }
  }
}

export class CreateSessionGroupDto {
  trainingSessions: { trainingSessionUuid: string }[];

  constructor(createSessionGroupDto) {
    this.trainingSessions = createSessionGroupDto;
  }

  getDto(): Prisma.TrainingSessionGroupTempCreateInput {
    return {
        trainingSessions: {
            connect: {
                uuid: this.trainingSessions.map(v => v.trainingSessionUuid)
            }
        }
    }
  }
}
