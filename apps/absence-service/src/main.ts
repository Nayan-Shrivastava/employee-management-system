import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);

  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: configService.get<string>('ABSENCE_HOST', '127.0.0.1'),
      port: configService.get<number>('ABSENCE_PORT', 4002),
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen();
  console.log(
    `Absence-service running on tcp://${configService.get<string>(
      'ABSENCE_HOST',
      '127.0.0.1'
    )}:${configService.get<number>('ABSENCE_PORT', 4002)}`
  );
}
bootstrap();
