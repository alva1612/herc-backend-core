import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionTempDto } from './dto/create-session.dto';
import { ListSessionDto } from './dto/list-session.dto';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) { }

  @Post()
  createTemp(@Body() createSessionDto: typeof CreateSessionTempDto) {
    const dto = new CreateSessionTempDto(createSessionDto)
    return this.sessionService.create(dto);
  }

  // @Post('unavailable')
  // create(@Body() createSessionDto: CreateSessionDto) {
  //   return this.sessionService.create(createSessionDto);
  // }

  @Get()
  findAll(@Query() queryParams) {
    return this.sessionService.findAll(new ListSessionDto(queryParams));
  }

  @Get('last/:exerciseUuid')
  findLastTempSessionByExercise(@Param('exerciseUuid') exerciseUuid) {
    return this.sessionService.findLastSessionByExercise(exerciseUuid);
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
