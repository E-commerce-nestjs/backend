import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Match } from 'src/modules/auth/decorators/match.decorator';

export class ChangePasswordDto {
    @ApiProperty({ required: true, description: 'Current password' })
    @IsNotEmpty()
    @IsString()
    currentPassword: string;

    @ApiProperty({ required: true, description: 'New password' })
    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message:
            'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    newPassword: string;

    @ApiProperty({ required: true, description: 'Confirm new password' })
    @IsNotEmpty()
    @IsString()
    @Match('newPassword', { message: 'Confirm new password does not match' })
    confirmNewPassword: string;
}
