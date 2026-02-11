import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindAllUserResponseDto, FindOneUserResponseDto, QueryUserDto } from './dtos/query-user.dto';
import { Prisma } from 'generated/prisma/client';
import { UpdateUserDto, UpdateUserResponseDto } from './dtos/update-user.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: QueryUserDto): Promise<FindAllUserResponseDto[]> {
        const { search, role, sortBy, sortDirection, page = 1, limit = 10 } = query;

        const where: Prisma.UserWhereInput = {};

        if (search) {
            where.OR = [
                {
                    firstName: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    lastName: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    email: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        if (role) {
            where.role = role;
        }

        const orderBy: Prisma.UserOrderByWithRelationInput = {};

        if (sortBy && sortDirection) {
            orderBy[sortBy] = sortDirection;
        } else {
            orderBy.createdAt = 'desc';
        }

        return this.prisma.user.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
            omit: {
                password: true,
            },
        });
    }

    async findOne(id: string): Promise<FindOneUserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: {
                id,
            },
            omit: {
                password: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async updateProfile(id: string, updateUserDto: UpdateUserDto): Promise<UpdateUserResponseDto> {
        const user = this.prisma.user.update({
            where: {
                id,
            },
            data: {
                ...updateUserDto,
            },
            omit: {
                password: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                id,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);

        if (!isPasswordValid) {
            throw new BadRequestException('Invalid current password');
        }

        const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

        if (hashedPassword === user.password) {
            throw new BadRequestException('New password is the same as current password');
        }

        await this.prisma.user.update({
            where: {
                id,
            },
            data: {
                password: hashedPassword,
            },
        });

        return;
    }

    async deleteUser(id: string) {
        const user = await this.prisma.user.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
            },
            omit: {
                password: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return;
    }
}
