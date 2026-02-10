import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'generated/prisma/enums';

export class User {
    @ApiProperty({ example: '1', description: 'User id' })
    id: string;

    @ApiProperty({ example: 'john@gmail.com', description: 'User email' })
    email: string;

    @ApiProperty({ example: 'Password@123', description: 'User password' })
    password: string;

    @ApiProperty({ example: '1', description: 'User role' })
    role: Role;

    @ApiProperty({ example: 'John', description: 'User first name', nullable: true })
    firstName?: string;

    @ApiProperty({ example: 'Doe', description: 'User last name', nullable: true })
    lastName?: string;

    @ApiProperty({ example: new Date().toISOString(), description: 'User created at' })
    createdAt: Date;

    @ApiProperty({ example: new Date().toISOString(), description: 'User updated at' })
    updatedAt: Date;
}
