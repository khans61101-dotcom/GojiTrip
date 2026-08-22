import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { RestaurantsService } from './restaurants.service';

import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  // ============================================================
  // GET /api/v1/restaurants
  // ============================================================

  @Get()
  async findAll() {
    return this.restaurantsService.findAll();
  }

  // ============================================================
  // GET /api/v1/restaurants/:id
  // ============================================================

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.restaurantsService.findOne(id);
  }

  // ============================================================
  // POST /api/v1/restaurants
  // ============================================================

  @Post()
  async create(
    @Body()
    createRestaurantDto: CreateRestaurantDto,
  ) {
    return this.restaurantsService.create(createRestaurantDto);
  }

  // ============================================================
  // PATCH /api/v1/restaurants/:id
  // ============================================================

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateRestaurantDto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(id, updateRestaurantDto);
  }

  // ============================================================
  // DELETE /api/v1/restaurants/:id
  // ============================================================

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.restaurantsService.remove(id);
  }
}
