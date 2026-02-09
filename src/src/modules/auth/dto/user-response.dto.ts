import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'generated/prisma/enums';

export class UserResponseDto {
  @ApiProperty({ example: 'clx1234567890', description: 'User ID' })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  lastName: string;

  @ApiProperty({ enum: Role, example: Role.USER, description: 'User role' })
  role: Role;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Updated at' })
  updatedAt: Date;
}
