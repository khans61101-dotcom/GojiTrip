import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HotelsService {
  constructor(private prisma: PrismaService) {}

  create(createHotelDto: CreateHotelDto) {
    return this.prisma.hotel.create({ data: createHotelDto as any });
  }

  findAll() {
    return this.prisma.hotel.findMany();
  }

  async findOne(id: number) {
    const hotel = await this.prisma.hotel.findUnique({ where: { id } });
    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
    return hotel;
  }

  async update(id: number, updateHotelDto: UpdateHotelDto) {
    try {
      return await this.prisma.hotel.update({
        where: { id },
        data: updateHotelDto as any,
      });
    } catch (error) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.hotel.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
  }
}
