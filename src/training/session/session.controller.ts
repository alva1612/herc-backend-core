import { Controller, Post, Body, Get, Query, Param, NotFoundException } from '@nestjs/common';
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
  async findLastTempSessionByExercise(@Param('exerciseUuid') exerciseUuid) {
    const res = await this.sessionService.findLastSessionByExercise(exerciseUuid);
    if (!res) {
      throw new NotFoundException();
    }
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
