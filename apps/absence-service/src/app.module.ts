import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AbsenceService } from './absence.service';
import { AbsenceController } from './absence.controller';
import { AbsenceRequest, User } from '@eams/database';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_PATH ?? 'eams.sqlite',
      entities: [AbsenceRequest, User],
      synchronize: true, // ⚠️ dev only
    }),
    TypeOrmModule.forFeature([AbsenceRequest, User]),
  ],
  providers: [AbsenceService],
  controllers: [AbsenceController],
})
export class AppModule {}
