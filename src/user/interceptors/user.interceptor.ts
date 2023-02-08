import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';

export class UserInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers?.authorization?.split('Bearer ')[1];
    request.user = {};

    if (token) {
      try {
        request.user = jwt.verify(token, process.env.SIGNIN_TOKEN_KEY);
      } catch (e) {
        if (e.name === 'TokenExpiredError') {
          throw new UnauthorizedException('expired jwt');
        } else {
          throw new UnauthorizedException('invalid jwt');
        }
      }
    }

    return next.handle();
  }
}
