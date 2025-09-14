import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.ABSENCE_HOST ?? '127.0.0.1',
      port: Number(process.env.ABSENCE_PORT ?? 4002),
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen();
  console.log(
    `Absence-service running on tcp://${process.env.ABSENCE_HOST ?? '127.0.0.1'}:${
      process.env.ABSENCE_PORT ?? 4002
    }`,
  );
}
bootstrap();
