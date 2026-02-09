import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Role, User } from 'generated/prisma/client';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { UserResponseDto } from './dto/user-response.dto';
import {type Request,type Response } from 'express';
import { AppResponse, AppResponseData } from 'src/src/common/bases/api-response';
import { setRefreshTokenCookie } from './helpers/cookies.helper';
import { JwtAuthGuard } from './guards/auth.guard';
import { User as UserDecorator} from './decorators/user.decorator';
import { Roles } from './decorators/role.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { createAppResponseDto } from 'src/src/common/dto/app-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({summary:"Register",description:"Register a new user"})
  @ApiResponse({status:HttpStatus.OK,description:"Register successfully",type: createAppResponseDto(UserResponseDto)})
  @ApiResponse({status:HttpStatus.BAD_REQUEST,description:"Validation failed or user already exists"})
  async register(@Body() registerDto : RegisterDto):Promise<AppResponseData<Omit<User,'password'>>>{    
    const user = await this.authService.register(registerDto)
    return AppResponse.ok<Omit<User,'password'>>(user,"Register successfully",HttpStatus.OK)
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:"Login",description:"Login with email and password"})
  @ApiResponse({status:HttpStatus.OK,description:"Login successfully",type: createAppResponseDto(LoginResponseDto)})
  @ApiResponse({status:HttpStatus.UNAUTHORIZED,description:"Invalid credentials"})
  async login(@Body() loginDto:LoginDto, @Res({ passthrough: true }) res:Response):Promise<AppResponseData<LoginResponseDto>>{
    const {accessToken,refreshToken,refreshTtl} = await this.authService.login(loginDto)
    
    setRefreshTokenCookie(res,refreshToken,refreshTtl)
  
    return AppResponse.ok<LoginResponseDto>({accessToken},"Login successfully",HttpStatus.OK)
  }

    @Post("refresh-token")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({summary:"Refresh Token",description:"Get new access token using refresh token from cookie"})
    @ApiResponse({status:HttpStatus.OK,description:"Token refreshed successfully",type: createAppResponseDto(LoginResponseDto)})
    @ApiResponse({status:HttpStatus.UNAUTHORIZED,description:"Invalid or expired refresh token"})
    async refreshToken(@Req() req:Request,@Res({ passthrough: true }) res:Response){
      const refreshToken = req.cookies.refresh_token as string

      if(!refreshToken){
        throw new UnauthorizedException("Refresh token not found")
      }
      
      const {accessToken,refreshToken:newRefreshToken,refreshTtl} = await this.authService.refreshUserAccessToken(refreshToken)

      if(newRefreshToken && refreshTtl){
        setRefreshTokenCookie(res,newRefreshToken,refreshTtl)
      }

      return AppResponse.ok<LoginResponseDto>({accessToken},"Refresh token successfully",HttpStatus.OK)
    }


    @UseGuards(JwtAuthGuard)
    @Get("me")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({summary:"Get Current User",description:"Get current authenticated user information"})
    @ApiResponse({status:HttpStatus.OK,description:"User retrieved successfully",type: createAppResponseDto(UserResponseDto)})
    @ApiResponse({status:HttpStatus.UNAUTHORIZED,description:"Unauthorized"})
    async me(@UserDecorator() user:Omit<User,'password'>):Promise<AppResponseData<Omit<User,'password'>>>{
      return AppResponse.ok<Omit<User,'password'>>(user,"Get user successfully",HttpStatus.OK)
    }
}
