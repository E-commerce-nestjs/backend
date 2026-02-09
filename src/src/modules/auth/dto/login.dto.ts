import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class LoginDto {
    @ApiProperty({example:"[EMAIL_ADDRESS]",description:"User email"})
    @IsEmail({},{message:"Email is not valid"})
    @IsString({message:"Email must be a string"})
    @IsNotEmpty({message:"Email is required"})
    email:string
    
    @ApiProperty({example:"Password@123",description:"User password"})
    @IsString({message:"Password must be a string"})
    @IsNotEmpty({message:"Password is required"})
    @MinLength(8,{message:"Password must be at least 8 characters long"})
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {message:"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"})
    password:string
}

export class LoginResponseDto{
    @ApiProperty({example:"access_token",description:"Access token"})
    accessToken:string
}

export class LoginServiceResponseDto{
    @ApiProperty({example:"access_token",description:"Access token"})
    accessToken:string
    @ApiProperty({example:"refresh_token",description:"Refresh token"})
    refreshToken:string
    @ApiProperty({example:3600,description:"Refresh token time to live"})
    refreshTtl:number
}