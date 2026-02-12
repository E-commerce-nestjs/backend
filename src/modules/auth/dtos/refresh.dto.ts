import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
    @ApiProperty({ example: 'refresh_token', description: 'Refresh token' })
    @IsString()
    refreshToken: string;
}

export class RefreshTokenServiceResponseDto {
    @ApiProperty({ example: 'access_token', description: 'Access token' })
    accessToken: string;
    @ApiProperty({ example: 'refresh_token', description: 'Refresh token' })
    refreshToken?: string;
    @ApiProperty({ example: 3600, description: 'Refresh token time to live' })
    refreshTtl?: number;
}
