import { Body, Controller, Post, Get } from '@nestjs/common';
import { Param, Res } from '@nestjs/common/decorators';
import {
  GenerateProductKeyDto,
  SignInDto,
  SignUpDto,
  UserDto,
} from '../dtos/auth.dto';
import { AuthService } from './auth.service';
import { UserType } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { ParseEnumPipe } from '@nestjs/common/pipes';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { User } from '../../decorators/user.decorator';
import { Throttle } from '@nestjs/throttler/dist/throttler.decorator';
import { Response, CookieOptions } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle(10)
  @Post('signup/:userType')
  async signUp(
    @Body() body: SignUpDto,
    @Param('userType', new ParseEnumPipe(UserType)) userType: UserType,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (userType !== UserType.buyer) {
      if (!body.productKey) {
        throw new UnauthorizedException();
      }

      try {
        const payload = jwt.verify(
          body.productKey,
          process.env.PRODUCT_TOKEN_KEY,
        ) as jwt.VerifyOptions & { userEmail: string; userType: UserType };

        if (payload.userType !== userType || payload.userEmail !== body.email) {
          throw new UnauthorizedException();
        }
      } catch (error) {
        throw new UnauthorizedException();
      }
    }

    return this.authService.signUp(body, userType, response);
  }

  @Throttle(10)
  @Post('signin')
  async signIn(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signIn(body, response);
  }

  @Throttle(10)
  @Post('key')
  generateProductKey(@Body() body: GenerateProductKeyDto) {
    return this.authService.generateProducKey(body);
  }

  @Get('me')
  me(@User() user: UserDto) {
    return user;
  }
}
