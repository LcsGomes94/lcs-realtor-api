import { Injectable, ConflictException, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateProductKeyDto, SignInDto, SignUpDto } from '../dtos/auth.dto';
import { User, UserType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { CookieOptions, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signUp(
    { name, email, password, phone }: SignUpDto,
    userType: UserType,
    response: Response,
  ) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (userExists) {
      throw new ConflictException();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        user_type: userType,
      },
    });

    return this.generateJwtResponse(user, response);
  }

  async signIn({ email, password }: SignInDto, response: Response) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new HttpException('invalid credentials', 400);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new HttpException('invalid credentials', 400);
    }

    return this.generateJwtResponse(user, response);
  }

  generateProducKey({ email: userEmail, userType }: GenerateProductKeyDto) {
    return jwt.sign(
      {
        iss: 'RealtorApp',
        aud: 'signup',
        userEmail,
        userType,
      },
      process.env.PRODUCT_TOKEN_KEY,
      {
        expiresIn: '3d',
      },
    );
  }

  private generateSessionJwt(userType: UserType, userId: number) {
    return jwt.sign(
      {
        iss: 'RealtorApp',
        aud: 'signin',
        userId: userId,
        userType,
      },
      process.env.SIGNIN_TOKEN_KEY,
      {
        expiresIn: '7d',
      },
    );
  }

  private generateJwtResponse(user: User, response: Response) {
    const jwt = this.generateSessionJwt(user.user_type, user.id);
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: 'strict',
      path: '/',
    };

    response.cookie('jwt', jwt, cookieOptions);

    return {
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userPhone: user.phone,
      userType: user.user_type,
    };
  }
}
