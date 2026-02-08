import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { User } from 'generated/prisma/client';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import {type Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiResponse, ApiResponseData } from 'src/src/common/bases/api-response';
import { isDevelopment } from 'src/src/utils/isDevelopment';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly configService:ConfigService
  ) {

  }

  @Post("register")
  async register(@Body() registerDto : RegisterDto):Promise<Omit<User,'password'>>{    
    return this.authService.register(registerDto)
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto:LoginDto, @Res({ passthrough: true }) res:Response):Promise<ApiResponseData<LoginResponseDto>>{
    const {accessToken,refreshToken} = await this.authService.login(loginDto)

   const refreshTtl = this.configService.get<number>(
    'AUTH_JWT_REFRESH_TOKEN_TTL',
    7 * 24 * 60 * 60
  );
  
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure:isDevelopment() ? false : true,
    sameSite:'strict',
    maxAge: refreshTtl * 1000,
  });
      return ApiResponse.ok<LoginResponseDto>({accessToken},"Login successfully",HttpStatus.OK)
    }
}
