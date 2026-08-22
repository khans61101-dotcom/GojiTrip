import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Room } from '@prisma/client';
/**
 * Service handling room related operations.
 * Provides methods to query rooms for a specific hotel.
 */
@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all rooms belonging to a given hotel.
   * @param hotelId The numeric ID of the hotel.
   * @returns An array of Room records.
   */
  async findByHotel(hotelId: number): Promise<Room[]> {
    return this.prisma.room.findMany({
      where: { hotelId },
    });
  }
}
