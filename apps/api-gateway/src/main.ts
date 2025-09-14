import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { RequestLoggingInterceptor } from '@eams/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new RequestLoggingInterceptor());
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
  console.log(`API Gateway listening on ${await app.getUrl()}`);
}
bootstrap();
