import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // CREATE
  // ============================================================

  async create(createRestaurantDto: CreateRestaurantDto) {
    const restaurant = await this.prisma.restaurant.create({
      data: {
        restaurantName: createRestaurantDto.restaurantName,

        location: createRestaurantDto.location,

        contactDetails: createRestaurantDto.contactDetails,

        cuisineTypes: createRestaurantDto.cuisineTypes,

        openingHours: createRestaurantDto.openingHours,

        imageUrl: createRestaurantDto.imageUrl ?? '',

        photos: createRestaurantDto.photos ?? [],

        recommendedDishes: createRestaurantDto.recommendedDishes ?? [],

        priceRange: createRestaurantDto.priceRange,

        approvalStatus: createRestaurantDto.approvalStatus ?? 'Draft',

        createdByName: createRestaurantDto.createdByName ?? 'Anonymous',
      },
    });

    return this.getRestaurantWithImage(restaurant.id);
  }

  // ============================================================
  // GET ALL
  // ============================================================

  async findAll() {
    const restaurants = await this.prisma.restaurant.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Promise.all(
      restaurants.map((restaurant) =>
        this.getRestaurantWithImage(restaurant.id),
      ),
    );
  }

  // ============================================================
  // GET ONE
  // ============================================================

  async findOne(id: number) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: {
        id,
      },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return this.getRestaurantWithImage(id);
  }

  // ============================================================
  // UPDATE
  // ============================================================

  async update(id: number, updateRestaurantDto: UpdateRestaurantDto) {
    const existing = await this.prisma.restaurant.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    const restaurant = await this.prisma.restaurant.update({
      where: {
        id,
      },
      data: {
        ...(updateRestaurantDto.restaurantName !== undefined && {
          restaurantName: updateRestaurantDto.restaurantName,
        }),

        ...(updateRestaurantDto.location !== undefined && {
          location: updateRestaurantDto.location,
        }),

        ...(updateRestaurantDto.contactDetails !== undefined && {
          contactDetails: updateRestaurantDto.contactDetails,
        }),

        ...(updateRestaurantDto.cuisineTypes !== undefined && {
          cuisineTypes: updateRestaurantDto.cuisineTypes,
        }),

        ...(updateRestaurantDto.openingHours !== undefined && {
          openingHours: updateRestaurantDto.openingHours,
        }),

        ...(updateRestaurantDto.priceRange !== undefined && {
          priceRange: updateRestaurantDto.priceRange,
        }),

        ...(updateRestaurantDto.imageUrl !== undefined && {
          imageUrl: updateRestaurantDto.imageUrl,
        }),

        ...(updateRestaurantDto.approvalStatus !== undefined && {
          approvalStatus: updateRestaurantDto.approvalStatus,
        }),

        ...(updateRestaurantDto.createdByName !== undefined && {
          createdByName: updateRestaurantDto.createdByName,
        }),
      },
    });

    return this.getRestaurantWithImage(restaurant.id);
  }

  // ============================================================
  // DELETE
  // ============================================================

  async remove(id: number) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: {
        id,
      },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    // Remove restaurant-related media first.
    // This prevents orphan restaurant images.
    await this.prisma.media.deleteMany({
      where: {
        entityId: String(id),
        entityType: 'restaurant',
      },
    });

    await this.prisma.restaurant.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Restaurant deleted successfully',
      id: String(id),
    };
  }

  // ============================================================
  // RESTAURANT + IMAGE
  // ============================================================

  private async getRestaurantWithImage(restaurantId: number) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: {
        id: restaurantId,
      },
    });

    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${restaurantId} not found`,
      );
    }

    const media = await this.prisma.media.findFirst({
      where: {
        entityId: String(restaurantId),
        entityType: 'restaurant',
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return {
      ...restaurant,

      // Frontend expects imageUrl
      imageUrl: media?.url ?? null,
    };
  }
}
