import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RoomsService } from './rooms.service';

@Module({
  imports: [PrismaModule],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
