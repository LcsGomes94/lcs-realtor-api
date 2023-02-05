import { Body, Controller, Post } from '@nestjs/common';
import { Param } from '@nestjs/common/decorators';
import { GenerateProductKeyDto, SignInDto, SignUpDto } from '../dtos/auth.dto';
import { AuthService } from './auth.service';
import { UserType } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { ParseEnumPipe } from '@nestjs/common/pipes';
import { UnauthorizedException } from '@nestjs/common/exceptions';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/:userType')
  async signUp(
    @Body() body: SignUpDto,
    @Param('userType', new ParseEnumPipe(UserType)) userType: UserType,
  ) {
    if (userType !== UserType.buyer) {
      if (!body.productKey) {
        throw new UnauthorizedException();
      }

      try {
        const payload = jwt.verify(
          body.productKey,
          process.env.SIGNUP_TOKEN_KEY,
        ) as jwt.VerifyOptions & { sub: string; userType: UserType };

        if (payload.userType !== userType || payload.sub !== body.email) {
          throw new UnauthorizedException();
        }
      } catch (error) {
        throw new UnauthorizedException();
      }
    }

    return this.authService.signUp(body, userType);
  }

  @Post('signin')
  signIn(@Body() body: SignInDto) {
    return this.authService.signIn(body);
  }

  @Post('key')
  generateProductKey(@Body() body: GenerateProductKeyDto) {
    return this.authService.generateProducKey(body);
  }
}