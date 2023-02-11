import { CanActivate, ExecutionContext } from '@nestjs/common/interfaces';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserType } from '@prisma/client';

type JwtPayload = {
  userId: number;
  userType: UserType;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const allowedRoles = this.reflector.get<UserType[]>(
      'roles',
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();
    const token = request.headers?.authorization?.split('Bearer ')[1];

    if (allowedRoles?.length) {
      try {
        const payload = jwt.verify(
          token,
          process.env.SIGNIN_TOKEN_KEY,
        ) as JwtPayload;
        if (!allowedRoles.includes(payload.userType)) {
          return false;
        }
      } catch (error) {
        return false;
      }
    }

    return true;
  }
}
