import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { User } from 'generated/prisma/client';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import {type Request,type Response } from 'express';
import { ApiResponse, ApiResponseData } from 'src/src/common/bases/api-response';
import { setRefreshTokenCookie } from './helpers/cookies.helper';
import { JwtAuthGuard } from './guards/auth.guard';
import { User as UserDecorator} from './decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
  ) {

  }

  @Post("register")
  async register(@Body() registerDto : RegisterDto):Promise<Omit<User,'password'>>{    
    return this.authService.register(registerDto)
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto:LoginDto, @Res({ passthrough: true }) res:Response):Promise<ApiResponseData<LoginResponseDto>>{
    const {accessToken,refreshToken,refreshTtl} = await this.authService.login(loginDto)
    
    setRefreshTokenCookie(res,refreshToken,refreshTtl)
  
    return ApiResponse.ok<LoginResponseDto>({accessToken},"Login successfully",HttpStatus.OK)
  }

    @Post("refresh-token")
    async refreshToken(@Req() req:Request,@Res({ passthrough: true }) res:Response){
      const refreshToken = req.cookies.refresh_token as string

      if(!refreshToken){
        throw new UnauthorizedException("Refresh token not found")
      }
      
      const {accessToken,refreshToken:newRefreshToken,refreshTtl} = await this.authService.refreshUserAccessToken(refreshToken)

      if(newRefreshToken && refreshTtl){
        setRefreshTokenCookie(res,newRefreshToken,refreshTtl)
      }

      return ApiResponse.ok<LoginResponseDto>({accessToken},"Refresh token successfully",HttpStatus.OK)
    }


    @UseGuards(JwtAuthGuard)
    @Get("me")
    async me(@UserDecorator() user:Omit<User,'password'>):Promise<ApiResponseData<Omit<User,'password'>>>{
      return ApiResponse.ok<Omit<User,'password'>>(user,"Get user successfully",HttpStatus.OK)
    }
}
