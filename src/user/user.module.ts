import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
  imports: [PrismaModule],
})
export class UserModule {}
