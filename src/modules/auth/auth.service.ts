import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import { LoginDto, LoginServiceResponseDto } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenServiceResponseDto } from './dtos/refresh.dto';
import { RedisService } from '../redis/redis.service';
import { UserResponseDto } from '../users/dtos/user-response.dto';

@Injectable()
export class AuthService {
    private readonly SALT_ROUNDS = 10;
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        // private readonly redisService:RedisService
    ) {}

    async register(registerDto: RegisterDto): Promise<UserResponseDto> {
        const { firstName, lastName, email, password } = registerDto;

        const existingUser = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            throw new ConflictException(`User with email ${email} already exists`);
        }

        const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
            },
            omit: {
                password: true,
            },
        });
        return user;
    }

    async generateTokens(id: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        const payload = {
            sub: id,
        };
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = randomBytes(64).toString('hex');
        return {
            accessToken,
            refreshToken,
        };
    }

    async login({ email, password }: LoginDto): Promise<LoginServiceResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            this.logger.warn(`Failed login attempt for email: ${email}`);
            throw new UnauthorizedException(`Invalid credentials`);
        }
        const { accessToken, refreshToken } = await this.generateTokens(user.id);

        const { refreshTtl } = await this.updateRefreshToken(user.id, refreshToken);

        // await this.redisService.setex(`user:${user.id}`,refreshTtl,refreshToken)
        this.logger.log(`Successful login for user: ${user.id}`);
        return {
            accessToken,
            refreshToken,
            refreshTtl,
        };
    }

    async updateRefreshToken(id: string, refreshToken: string): Promise<any> {
        // Hash refresh token trước khi lưu DB
        const hashedToken = createHash('sha256').update(refreshToken).digest('hex');

        const refreshTtl =
            this.configService.get<number>('AUTH_JWT_REFRESH_TOKEN_TTL', 7 * 24 * 60 * 60) * 1000 + Date.now();

        await this.prisma.refreshToken.create({
            data: {
                token: hashedToken,
                userId: id,
                expiresAt: new Date(refreshTtl),
            },
        });

        return {
            refreshToken,
            refreshTtl,
        };
    }

    async refreshUserAccessToken(refreshToken: string): Promise<RefreshTokenServiceResponseDto> {
        const hashedToken = createHash('sha256').update(refreshToken).digest('hex');
        // Khi verify, tìm bằng hash
        const token = await this.prisma.refreshToken.findUnique({
            where: {
                token: hashedToken,
            },
        });
        if (!token || token.invokedAt) {
            throw new UnauthorizedException(`Invalid refresh token`);
        }
        if (token.expiresAt < new Date()) {
            throw new UnauthorizedException(`Refresh token expired`);
        }

        const shouldRotate = token.expiresAt < new Date(Date.now() + 24 * 60 * 60 * 1000);

        if (shouldRotate) {
            await this.prisma.refreshToken.update({
                where: {
                    id: token.id,
                },
                data: {
                    invokedAt: new Date(),
                },
            });

            const { accessToken, refreshToken } = await this.generateTokens(token.userId);

            const { refreshTtl } = await this.updateRefreshToken(token.userId, refreshToken);

            return {
                accessToken,
                refreshToken,
                refreshTtl,
            };
        }
        const { accessToken } = await this.generateTokens(token.userId);
        return {
            accessToken,
        };
    }
}
