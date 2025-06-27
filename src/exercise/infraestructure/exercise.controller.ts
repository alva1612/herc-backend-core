import { Controller, Post, Body, Get, Query, Patch, Param, Put } from '@nestjs/common';
import { ExerciseService } from '../exercise.service';
import { CreateExerciseDto } from '../dto/create-exercise.dto';
import { UpdateExerciseDto } from '../dto/update-exercise.dto';

@Controller('exercise')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Post()
  create(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exerciseService.create(createExerciseDto);
  }

  @Put(':identifier')
  patch(@Body() updateDto: UpdateExerciseDto, @Param('identifier') identifier) {
    return this.exerciseService.update(identifier, updateDto)
  }

  @Get()
  findAll(@Query('filters') filters = "{}") {
    return this.exerciseService.findAll(JSON.parse(filters));
  }
}
