import { Injectable, ConflictException, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateProductKeyDto, SignInDto, SignUpDto } from '../dtos/auth.dto';
import { UserType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signUp(
    { name, email, password, phone }: SignUpDto,
    userType: UserType,
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

    return this.generateSessionJwt(user.name, user.id);
  }

  async signIn({ email, password }: SignInDto) {
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

    return this.generateSessionJwt(user.name, user.id);
  }

  generateProducKey({ email: userEmail, userType }: GenerateProductKeyDto) {
    return jwt.sign(
      {
        iss: 'RealtorApp',
        aud: 'signup',
        sub: userEmail,
        userType,
      },
      process.env.SIGNUP_TOKEN_KEY,
      {
        expiresIn: '3d',
      },
    );
  }

  private generateSessionJwt(userName: string, userId: number) {
    return jwt.sign(
      {
        iss: 'RealtorApp',
        aud: 'signin',
        sub: userName,
        userId,
      },
      process.env.SIGNIN_TOKEN_KEY,
      {
        expiresIn: '7d',
      },
    );
  }
}
