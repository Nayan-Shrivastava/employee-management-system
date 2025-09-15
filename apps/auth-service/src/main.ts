import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { HttpToRpcExceptionFilter } from '@eams/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);

  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: configService.get<string>('AUTH_HOST', '127.0.0.1'),
      port: configService.get<number>('AUTH_PORT', 4001),
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpToRpcExceptionFilter());
  await app.listen();
  console.log(
    `Auth-service running on tcp://${configService.get<string>(
      'AUTH_HOST',
      '127.0.0.1'
    )}:${configService.get<string>('AUTH_HOST', '127.0.0.1')}`
  );
}
bootstrap();
