import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MuscleService } from './muscle.service';
import { CreateMuscleDto } from './dto/create-muscle.dto';
import { UpdateMuscleDto } from './dto/update-muscle.dto';

@Controller('muscle')
export class MuscleController {
  constructor(private readonly muscleService: MuscleService) {}

  @Post()
  create(@Body() createMuscleDto: CreateMuscleDto) {
    return this.muscleService.create(createMuscleDto);
  }

  @Get()
  findAll(@Query('expand') expand) {
    return this.muscleService.findAll({ expand });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.muscleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMuscleDto: UpdateMuscleDto) {
    return this.muscleService.update(+id, updateMuscleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.muscleService.remove(+id);
  }
}
