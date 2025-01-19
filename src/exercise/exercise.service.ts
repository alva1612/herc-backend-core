import { Injectable } from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class ExerciseService {

  constructor(private readonly clientService: PrismaService) {}

  create(createExerciseDto: CreateExerciseDto) {
    const client = this.clientService.getClient();
    return client.exercise.create({data: createExerciseDto})
  }

  // findAll() {
  //   return `This action returns all exercise`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} exercise`;
  // }

  // update(id: number, updateExerciseDto: UpdateExerciseDto) {
  //   return `This action updates a #${id} exercise`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} exercise`;
  // }
}
