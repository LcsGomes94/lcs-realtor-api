import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { HomeModule } from './home/home.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UserInterceptor } from './interceptors/user.interceptor';
import { AuthGuard } from './guards/auth.guard';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler/dist/throttler.guard';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    HomeModule,
    CacheModule.register(),
    ThrottlerModule.forRoot({ limit: 20, ttl: 60 }),
  ],
  controllers: [],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: UserInterceptor },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: CacheInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
