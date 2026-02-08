import { IsString } from "class-validator";

export class RefreshTokenDto {
    @IsString()
    refreshToken:string
}

export class RefreshTokenServiceResponseDto{
    accessToken:string
    refreshToken?:string
    refreshTtl?:number
}
