import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransportDto } from './dto/create-transport.dto';
import { UpdateTransportDto } from './dto/update-transport.dto';

@Injectable()
export class TransportService {
  constructor(private prisma: PrismaService) {}

  create(createTransportDto: CreateTransportDto) {
    return this.prisma.transport.create({ data: createTransportDto });
  }

  findAll() {
    return this.prisma.transport.findMany();
  }

  findOne(id: number) {
    return this.prisma.transport.findUnique({ where: { id } });
  }

  update(id: number, updateTransportDto: UpdateTransportDto) {
    return this.prisma.transport.update({
      where: { id },
      data: updateTransportDto,
    });
  }

  remove(id: number) {
    return this.prisma.transport.delete({ where: { id } });
  }
}
