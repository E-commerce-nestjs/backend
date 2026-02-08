import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";
import { Match } from "../decorators/match.decorator";

export class RegisterDto {
 
    @IsEmail({},{message:"Email is not valid"})
    @IsString({message:"Email must be a string"})
    @IsNotEmpty({message:"Email is required"})
    email:string

    @IsString({message:"Password must be a string"})
    @IsNotEmpty({message:"Password is required"})
    @MinLength(8,{message:"Password must be at least 8 characters long"})
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {message:"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"})
    password:string

    @Match('password',{message:"Passwords do not match"})
    @IsNotEmpty({message:"Confirm password is required"})
    confirmPassword:string

    @IsOptional()
    @IsString({message:"Name must be a string"})
    firstName?:string

    @IsOptional()
    @IsString({message:"Name must be a string"})
    lastName?:string
}