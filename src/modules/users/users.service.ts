import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserWithoutPassword } from './types/user-without-pass.type';
import { QueryUserDto } from './dtos/query-user.dto';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: QueryUserDto): Promise<UserWithoutPassword[]> {
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
}
