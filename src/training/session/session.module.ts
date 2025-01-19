import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { PrismaService } from 'src/common/prisma.service';

@Module({
  controllers: [SessionController],
  providers: [SessionService, PrismaService],
})
export class SessionModule {}
