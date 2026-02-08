import { HttpStatus } from '@nestjs/common';
import { ApiResponseKey } from '../enums/api-response-key.enum';

export interface ApiResponseData<T> {
  [ApiResponseKey.STATUS]: boolean;
  [ApiResponseKey.CODE]: number;
  [ApiResponseKey.MESSAGE]: string;
  [ApiResponseKey.DATA]?: T;
  [ApiResponseKey.ERRORS]?: T;
  [ApiResponseKey.TIMESTAMP]: string;
}

export class ApiResponse {
  static ok<T>(data: T, message: string = '', httpStatus: HttpStatus = HttpStatus.OK): ApiResponseData<T> {
    return {
      [ApiResponseKey.STATUS]: true,
      [ApiResponseKey.CODE]: httpStatus,
      [ApiResponseKey.MESSAGE]: message,
      [ApiResponseKey.DATA]: data,
      [ApiResponseKey.TIMESTAMP]: new Date().toISOString(),
    };
  }

  static error<T>(
    errors: T,
    message: string = '',
    httpStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ): ApiResponseData<T> {
    return {
      [ApiResponseKey.STATUS]: false,
      [ApiResponseKey.CODE]: httpStatus,
      [ApiResponseKey.MESSAGE]: message,
      [ApiResponseKey.ERRORS]: errors,
      [ApiResponseKey.TIMESTAMP]: new Date().toISOString(),
    };
  }

  static message(
    message: string = '',
    httpStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ): ApiResponseData<string> {
    return {
      [ApiResponseKey.STATUS]: httpStatus >= 200 && httpStatus < 300,
      [ApiResponseKey.CODE]: httpStatus,
      [ApiResponseKey.MESSAGE]: message,
      [ApiResponseKey.TIMESTAMP]: new Date().toISOString(),
    };
  }
}
