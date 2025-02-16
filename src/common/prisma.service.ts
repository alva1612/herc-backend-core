import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

@Injectable()
export class PrismaService {
  private prismaClient: PrismaClient;

  constructor() {
    this.prismaClient = client;
  }

  getClient() {
    return this.prismaClient;
  }
}
