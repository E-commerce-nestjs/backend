import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from 'generated/prisma/enums';
import { AppResponse, AppResponseData } from 'src/common/bases/api-response';
import { FindAllUserResponseDto, FindOneUserResponseDto, QueryUserDto } from './dtos/query-user.dto';
import { createAppResponseDto } from 'src/common/dto/app-response.dto';
import {
    ForbiddenErrorResponseDto,
    InternalServerErrorResponseDto,
    NotFoundErrorResponseDto,
    UnauthorizedErrorResponseDto,
} from 'src/common/dto/app-error-response.dto';
import { User } from '../auth/decorators/user.decorator';
import { UpdateUserDto, UpdateUserResponseDto } from './dtos/update-user.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // Get all users
    @Get()
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all users', description: 'Get all users' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Limit per page' })
    @ApiQuery({ name: 'search', type: String, required: false, description: 'Search query' })
    @ApiQuery({ name: 'role', type: String, required: false, description: 'Role' })
    @ApiQuery({ name: 'sortBy', type: String, required: false, description: 'Sort by' })
    @ApiQuery({ name: 'sortOrder', type: String, required: false, description: 'Sort order' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Get all users',
        type: createAppResponseDto(FindAllUserResponseDto, {
            code: HttpStatus.OK,
            message: 'Get all users successfully',
            isArray: true,
            example: {
                data: [
                    {
                        id: '1',
                        email: 'user1@example.com',
                        role: Role.USER,
                        firstName: 'John',
                        lastName: 'Doe',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        id: '2',
                        email: 'user2@example.com',
                        role: Role.ADMIN,
                        firstName: 'Admin',
                        lastName: 'User',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 2,
                    totalPages: 1,
                },
            },
        }),
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: UnauthorizedErrorResponseDto })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden', type: ForbiddenErrorResponseDto })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async findAll(@Query() query: QueryUserDto): Promise<AppResponseData<FindAllUserResponseDto>> {
        const response = await this.usersService.findAll(query);
        return AppResponse.ok<FindAllUserResponseDto>(response, 'Get all users successfully');
    }

    // Get user by id
    @Get(':id')
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get user by ID', description: 'Get user by ID' })
    @ApiParam({ name: 'id', type: String, required: true, description: 'User ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Get user by ID',
        type: createAppResponseDto(FindOneUserResponseDto, {
            code: HttpStatus.OK,
            message: 'Get user successfully',
            isArray: false,
        }),
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: UnauthorizedErrorResponseDto })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden', type: ForbiddenErrorResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found', type: NotFoundErrorResponseDto })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async findOne(@Param('id') id: string): Promise<AppResponseData<FindOneUserResponseDto>> {
        const user = await this.usersService.findOne(id);
        return AppResponse.ok<FindOneUserResponseDto>(user, 'Get user successfully');
    }

    // Update current user account
    @Patch('me')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update current user account', description: 'Update current user account' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Update current user account',
        type: createAppResponseDto(UpdateUserResponseDto, {
            code: HttpStatus.OK,
            message: 'Update user successfully',
            isArray: false,
        }),
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: UnauthorizedErrorResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found', type: NotFoundErrorResponseDto })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async updateUserProfile(
        @User('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<AppResponseData<UpdateUserResponseDto>> {
        const user = await this.usersService.updateProfile(id, updateUserDto);

        return AppResponse.ok<UpdateUserResponseDto>(user, 'Update user successfully');
    }

    // Change curent usser password
    @Patch('me/password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Change current user password', description: 'Change current user password' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Change current user password',
        type: createAppResponseDto(UpdateUserResponseDto, {
            code: HttpStatus.OK,
            message: 'Change user password successfully',
            isArray: false,
        }),
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: UnauthorizedErrorResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found', type: NotFoundErrorResponseDto })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async changePassword(
        @User('id') id: string,
        @Body() changePasswordDto: ChangePasswordDto,
    ): Promise<AppResponseData<string>> {
        await this.usersService.changePassword(id, changePasswordDto);

        return AppResponse.message('Change user password successfully');
    }

    // Delete current user account
    @Delete('me')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete current user account', description: 'Delete current user account' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Delete current user account',
        type: createAppResponseDto(UpdateUserResponseDto, {
            code: HttpStatus.OK,
            message: 'Delete user successfully',
            isArray: false,
        }),
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: UnauthorizedErrorResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found', type: NotFoundErrorResponseDto })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async deleteUser(@User('id') id: string): Promise<AppResponseData<string>> {
        await this.usersService.deleteUser(id);

        return AppResponse.message('Delete user successfully');
    }

    // Delete user by id
    @Delete(':id')
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete user by ID', description: 'Delete user by ID' })
    @ApiParam({ name: 'id', type: String, required: true, description: 'User ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Delete user by ID',
        type: createAppResponseDto(UpdateUserResponseDto, {
            code: HttpStatus.OK,
            message: 'Delete user successfully',
            isArray: false,
        }),
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: UnauthorizedErrorResponseDto })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden', type: ForbiddenErrorResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found', type: NotFoundErrorResponseDto })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async deleteUserById(@Param('id') id: string): Promise<AppResponseData<string>> {
        await this.usersService.deleteUser(id);

        return AppResponse.message('Delete user successfully');
    }
}
