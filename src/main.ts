import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validateCustomDecorators: true,
    }),
  );
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
