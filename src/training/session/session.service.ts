import { Injectable } from '@nestjs/common';
import { CreateSessionTempDto } from './dto/create-session.dto';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class SessionService {

  constructor(private clientService: PrismaService) {}

  create(createSessionDto: CreateSessionTempDto) {
    const client = this.clientService.getClient();

    const result = client.exerciseOnTrainingSessionsTemp.create({
      data: createSessionDto.getDto()
    });

    return result;
  }

  // findAll() {
  //   return `This action returns all session`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} session`;
  // }

  // update(id: number, updateSessionDto: UpdateSessionDto) {
  //   return `This action updates a #${id} session`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} session`;
  // }
}
