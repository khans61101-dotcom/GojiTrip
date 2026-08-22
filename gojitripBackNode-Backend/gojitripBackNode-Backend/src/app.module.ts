import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

import { TripsModule } from './trips/trips.module';
import { RoutesModule } from './routes/routes.module';

import { HotelsModule } from './hotels/hotels.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { ActivitiesModule } from './activities/activities.module';
import { MediaModule } from './media/media.module';

import { TransportModule } from './transport/transport.module';
import { WorkflowModule } from './workflow/workflow.module';
import { RoomsModule } from './rooms/rooms.module';
import { GuidesModule } from './guides/guides.module';

// Places module
import { PlacesModule } from './places/places.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    UsersModule,

    TripsModule,
    RoutesModule,

    HotelsModule,
    RestaurantsModule,
    ActivitiesModule,
    MediaModule,

    TransportModule,
    RoomsModule,
    WorkflowModule,
    GuidesModule,

    // Location / Google Places API
    PlacesModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}
