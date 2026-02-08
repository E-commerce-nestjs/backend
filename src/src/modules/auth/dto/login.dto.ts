import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator"

export class LoginDto {
    @IsEmail({},{message:"Email is not valid"})
    @IsString({message:"Email must be a string"})
    @IsNotEmpty({message:"Email is required"})
    email:string
    
    @IsString({message:"Password must be a string"})
    @IsNotEmpty({message:"Password is required"})
    @MinLength(8,{message:"Password must be at least 8 characters long"})
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {message:"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"})
    password:string
}

export class LoginResponseDto{
    accessToken:string
}

export class LoginServiceResponseDto{
    accessToken:string
    refreshToken:string
}