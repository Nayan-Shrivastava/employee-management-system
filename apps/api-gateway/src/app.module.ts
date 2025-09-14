import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AbsenceController } from './absence.controller';
import { JwtAuthGuard, RolesGuard } from '@eams/common';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // JWT for validation on gateway (same secret as auth-service)
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'supersecret',
      signOptions: { expiresIn: '7d' },
    }),
    // Client proxies to communicate with microservices over TCP
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_HOST ?? '127.0.0.1',
          port: Number(process.env.AUTH_PORT ?? 4001),
        },
      },
      {
        name: 'ABSENCE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.ABSENCE_HOST ?? '127.0.0.1',
          port: Number(process.env.ABSENCE_PORT ?? 4002),
        },
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
