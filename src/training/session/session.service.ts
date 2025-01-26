import { Injectable } from '@nestjs/common';
import { CreateSessionTempDto } from './dto/create-session.dto';
import { PrismaService } from 'src/common/prisma.service';
import { Prisma } from '@prisma/client';

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

  async findAll(filters: Prisma.ExerciseOnTrainingSessionsTempFindManyArgs['where']) {
    const client = this.clientService.getClient();

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
      where: filters
    })
    const total = await client.exerciseOnTrainingSessionsTemp.count({
      where: filters
    })
    return {
      data,
      total
    }
  }
}
