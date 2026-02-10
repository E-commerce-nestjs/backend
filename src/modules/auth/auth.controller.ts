import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, RegisterResponseDto } from './dtos/register.dto';
import { User } from 'generated/prisma/client';
import { LoginDto, LoginResponseDto } from './dtos/login.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { type Request, type Response } from 'express';
import { AppResponse, AppResponseData } from 'src/common/bases/api-response';
import { setRefreshTokenCookie } from './helpers/cookies.helper';
import { JwtAuthGuard } from './guards/auth.guard';
import { User as UserDecorator } from './decorators/user.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { createAppResponseDto } from 'src/common/dto/app-response.dto';
import { UnauthorizedErrorResponseDto, ValidationErrorResponseDto } from 'src/common/dto/app-error-response.dto';
import { Throttle } from '@nestjs/throttler';
import { type UserWithoutPassword } from '../users/types/user-without-pass.type';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @Throttle({ default: { getTracker: () => 'short' } })
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register', description: 'Register a new user' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Register successfully',
        type: createAppResponseDto(RegisterResponseDto, { code: HttpStatus.CREATED, message: 'Register successfully' }),
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation failed or user already exists',
        type: ValidationErrorResponseDto,
    })
    async register(@Body() registerDto: RegisterDto): Promise<AppResponseData<UserWithoutPassword>> {
        const user = await this.authService.register(registerDto);
        return AppResponse.ok<UserWithoutPassword>(user, 'Register successfully', HttpStatus.CREATED);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login', description: 'Login with email and password' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Login successfully',
        type: createAppResponseDto(LoginResponseDto),
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation failed', type: ValidationErrorResponseDto })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid credentials',
        type: UnauthorizedErrorResponseDto,
    })
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AppResponseData<LoginResponseDto>> {
        const { accessToken, refreshToken, refreshTtl } = await this.authService.login(loginDto);

        setRefreshTokenCookie(res, refreshToken, refreshTtl);

        return AppResponse.ok<LoginResponseDto>({ accessToken }, 'Login successfully', HttpStatus.OK);
    }

    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh Token', description: 'Get new access token using refresh token from cookie' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Token refreshed successfully',
        type: createAppResponseDto(LoginResponseDto),
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid or expired refresh token',
        type: UnauthorizedErrorResponseDto,
    })
    async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies.refresh_token as string;

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        const {
            accessToken,
            refreshToken: newRefreshToken,
            refreshTtl,
        } = await this.authService.refreshUserAccessToken(refreshToken);

        if (newRefreshToken && refreshTtl) {
            setRefreshTokenCookie(res, newRefreshToken, refreshTtl);
        }

        return AppResponse.ok<LoginResponseDto>({ accessToken }, 'Refresh token successfully', HttpStatus.OK);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get Current User', description: 'Get current authenticated user information' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User retrieved successfully',
        type: createAppResponseDto(UserResponseDto, { code: HttpStatus.OK, message: 'User retrieved successfully' }),
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: UnauthorizedErrorResponseDto })
    async me(@UserDecorator() user: UserWithoutPassword): Promise<AppResponseData<UserWithoutPassword>> {
        return AppResponse.ok<UserWithoutPassword>(user, 'Get user successfully', HttpStatus.OK);
    }
}
