import { Controller, Post, Body, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionGroupDto, CreateSessionTempDto } from './dto/create-session.dto';
import { ListSessionDto, ListSetDto } from './dto/list-session.dto';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('set')
  createTemp(@Body() createSessionDto: typeof CreateSessionTempDto) {
    console.log({createSessionDto})
    const dto = new CreateSessionTempDto(createSessionDto);
    return this.sessionService.createSetSmart(dto);
  }

  @Post()
  create(@Body() createSessionDto: Partial<CreateSessionGroupDto>) {
    const dto = new CreateSessionGroupDto(createSessionDto);
    return this.sessionService.createSessionGroup(dto);
  }

  @Get()
  find(@Query() queryParams) {
    return this.sessionService.findAll(new ListSessionDto(queryParams));
  }

  @Get('set')
  findSets(@Query() queryParams) {
    return this.sessionService.findAllSets(new ListSetDto(queryParams));
  }

  @Get('last/:exerciseUuid')
  async findLastSessionByExercise(@Param('exerciseUuid') exerciseUuid, @Query() queryParams) {
    const res = await this.sessionService.findLastSessionByExercise(exerciseUuid, queryParams.excludedSessionGroupUuid);
    if (!res) {
      throw new NotFoundException();
    }
    return res;
  }

  @Post('migrate/csv')
  async migrateFromCSV() {
    await this.sessionService.migrateFromCSV()
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.sessionService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
  //   return this.sessionService.update(+id, updateSessionDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.sessionService.remove(+id);
  // }
}
