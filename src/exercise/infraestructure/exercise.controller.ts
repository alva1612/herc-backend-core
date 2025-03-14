import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ExerciseService } from '../exercise.service';
import { CreateExerciseDto } from '../dto/create-exercise.dto';

@Controller('exercise')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Post()
  create(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exerciseService.create(createExerciseDto);
  }

  @Get()
  findAll(@Query('filters') filters = "{}") {
    return this.exerciseService.findAll(JSON.parse(filters));
  }
}
