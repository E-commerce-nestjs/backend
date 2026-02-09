import { ApiProperty, OmitType } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export class UserResponseDto extends OmitType(User,["password"]) {
}
