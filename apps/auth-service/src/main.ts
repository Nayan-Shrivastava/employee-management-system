import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { HttpToRpcExceptionFilter } from '@eams/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.AUTH_HOST ?? '127.0.0.1',
      port: Number(process.env.AUTH_PORT ?? 4001),
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpToRpcExceptionFilter());
  await app.listen();
  console.log(
    `Auth-service running on tcp://${process.env.AUTH_HOST ?? '127.0.0.1'}:${
      process.env.AUTH_PORT ?? 4001
    }`
  );
}
bootstrap();
