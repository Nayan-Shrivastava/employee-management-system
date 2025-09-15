import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AbsenceService } from './absence.service';
import { AbsenceController } from './absence.controller';
import { AbsenceRequest, User } from '@eams/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // make sure ConfigModule is available
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('DB_PATH', 'eams.sqlite'),
        entities: [AbsenceRequest, User],
        synchronize: true, // ⚠️ dev only
      }),
    }),
    TypeOrmModule.forFeature([AbsenceRequest, User]),
  ],
  providers: [AbsenceService],
  controllers: [AbsenceController],
})
export class AppModule {}
