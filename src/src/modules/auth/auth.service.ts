import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { User } from 'generated/prisma/client';
import { LoginDto, LoginServiceResponseDto } from './dto/login.dto';

@Injectable()
export class AuthService {

    private readonly SALT_ROUNDS = 10;

    constructor(private readonly prisma:PrismaService,
        private readonly jwtService:JwtService
    ){}


    async register (registerDto:RegisterDto):Promise<Omit<User,'password'>>{
        const {firstName,lastName,email,password} = registerDto

        const existingUser = await this.prisma.user.findUnique({
            where:{
                email
            }
        })

        if(existingUser){
            throw new ConflictException(`User with email ${email} already exists`)
        }

        const hashedPassword = await bcrypt.hash(password,this.SALT_ROUNDS)

        const user = await this.prisma.user.create({
            data:{
                email,
                password:hashedPassword,
                firstName,
                lastName
            },
            omit:{
                password:true,
            }
        })
        return user
    }

    async generateTokens(id:string):Promise<{
        accessToken:string,
        refreshToken:string
    }>{
        const payload = {
            sub:id
        }
        const accessToken = await this.jwtService.signAsync(payload)
        const refreshToken = randomBytes(64).toString('hex')
        return {
            accessToken,
            refreshToken,
        }
    }

    async login ({email,password}:LoginDto):Promise<LoginServiceResponseDto>{
        const user = await this.prisma.user.findUnique({
            where:{
                email
            }
        })
        if(!user || !await bcrypt.compare(password,user.password)){
            throw new UnauthorizedException(`Invalid credentials`)
        }
        const {accessToken,refreshToken} = await this.generateTokens(user.id)

        await this.updateRefreshToken(user.id,refreshToken)

        return {
            accessToken,
            refreshToken,
        }
    }

    async updateRefreshToken(id:string,refreshToken:string):Promise<void>{
        await this.prisma.user.update({
            where:{
                id
            },
            data:{
                refreshToken
            }
        })
    }
}
