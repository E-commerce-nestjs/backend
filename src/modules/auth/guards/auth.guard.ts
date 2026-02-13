import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any): any {
        if (err || !user) {
            throw err || new UnauthorizedException('Access token is not valid or expired');
        }
        return user;
    }
}
