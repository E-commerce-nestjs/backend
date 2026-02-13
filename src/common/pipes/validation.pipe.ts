/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-function-type */
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, HttpStatus } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AppResponse } from 'src/common/bases/api-response';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
    async transform(value: any, { metatype, type }: ArgumentMetadata) {
        if (type === 'custom' || !metatype || !this.toValidate(metatype)) {
            return value;
        }

        const object = plainToInstance(metatype, value);
        const errors = await validate(object);
        console.log('errors', errors);

        if (errors.length > 0) {
            const formatedErrors = this.formatErrors(errors);
            const response = AppResponse.error(formatedErrors, 'Validation failed', HttpStatus.BAD_REQUEST);
            // console.log(response);

            throw new BadRequestException(response);
        }
        return object;
    }

    private toValidate(metatype: Function): boolean {
        const types: Function[] = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }

    private formatErrors(errors: ValidationError[]) {
        const result: Record<string, string[]> = {};
        errors.forEach(error => {
            if (error.constraints) {
                result[error.property] = Object.values(error.constraints);
            }
        });
        return result;
    }
}
