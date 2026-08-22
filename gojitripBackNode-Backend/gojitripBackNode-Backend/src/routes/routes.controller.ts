import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { RoutesService } from './routes.service';

import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { PlanRouteDto } from './dto/plan-route.dto';

// ============================================================
// ROUTES CONTROLLER
// ============================================================

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  // ==========================================================
  // PLAN COMPLETE ROUTE
  //
  // POST /api/v1/routes/plan
  // ==========================================================

  @Post('plan')
  planRoute(@Body() planRouteDto: PlanRouteDto) {
    return this.routesService.planRoute(planRouteDto);
  }

  // ==========================================================
  // CREATE ROUTE
  //
  // POST /api/v1/routes
  // ==========================================================

  @Post()
  create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto);
  }

  // ==========================================================
  // GET ALL ROUTES
  //
  // GET /api/v1/routes
  // ==========================================================

  @Get()
  findAll() {
    return this.routesService.findAll();
  }

  // ==========================================================
  // GET ONE ROUTE
  //
  // GET /api/v1/routes/:id
  // ==========================================================

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routesService.findOne(Number(id));
  }

  // ==========================================================
  // UPDATE ROUTE
  //
  // PATCH /api/v1/routes/:id
  // ==========================================================

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRouteDto: UpdateRouteDto) {
    return this.routesService.update(Number(id), updateRouteDto);
  }

  // ==========================================================
  // DELETE ROUTE
  //
  // DELETE /api/v1/routes/:id
  // ==========================================================

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.routesService.remove(Number(id));
  }
}
