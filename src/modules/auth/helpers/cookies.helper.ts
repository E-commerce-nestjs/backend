import { Response } from "express";
import { isDevelopment } from 'src/utils/isDevelopment';

export const setRefreshTokenCookie = (res:Response,refreshToken:string,refreshTtl:number) => {
    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure:isDevelopment() ? false : true,
        sameSite:'strict',
        maxAge: refreshTtl * 1000,
        path:'api/v1/refresh-token'
      });
}