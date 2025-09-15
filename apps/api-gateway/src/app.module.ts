import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AbsenceController } from './absence.controller';
import { JwtAuthGuard, RolesGuard } from '@eams/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),

    // ✅ Use ConfigService with registerAsync
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'supersecret'),
        signOptions: { expiresIn: '7d' },
      }),
    }),

    // ✅ Same for microservice clients
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('AUTH_HOST', '127.0.0.1'),
            port: config.get<number>('AUTH_PORT', 4001),
          },
        }),
      },
      {
        name: 'ABSENCE_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('ABSENCE_HOST', '127.0.0.1'),
            port: config.get<number>('ABSENCE_PORT', 4002),
          },
        }),
      },
    ]),
  ],
  controllers: [AuthController, AbsenceController],
  providers: [
    // Global guards: JWT + Roles
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
