import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from 'generated/prisma/enums';
import { AppResponse, AppResponseData } from 'src/common/bases/api-response';
import { UserWithoutPassword } from './types/user-without-pass.type';
import { QueryUserDto } from './dtos/query-user.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @Roles(Role.ADMIN)
    async findAll(@Query() query: QueryUserDto): Promise<AppResponseData<UserWithoutPassword[]>> {
        const users = await this.usersService.findAll(query);
        return AppResponse.ok<UserWithoutPassword[]>(users);
    }
}
