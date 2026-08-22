import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const defaultUrl =
      'postgresql://neondb_owner:npg_wfjmlN1Ckp2d@ep-snowy-bread-axglka5l.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const envUrl = process.env.DATABASE_URL?.trim();
    const connectionUrl = envUrl && envUrl.length > 10 ? envUrl : defaultUrl;

    super({
      datasources: {
        db: {
          url: connectionUrl,
        },
      },
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to Database');
    } catch (error) {
      this.logger.error('Database connection error on startup:', error);
    }
  }
}


