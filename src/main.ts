import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // Enable static file serving for uploaded files (optional)
  app.useStaticAssets('uploads', { prefix: '/uploads' });

  await app.listen(3000);
}
bootstrap();
