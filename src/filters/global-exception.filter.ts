import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationError } from 'class-validator';


@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private translateValidationError(constraint: string, field: string, value: any): string {
    const translations: Record<string, string> = {
      'isString': `${field} должно быть строкой`,
      'isNotEmpty': `${field} не может быть пустым`,
      'isEmail': `${field} должно быть корректным email адресом`,
      'isOptional': `${field} является необязательным полем`,
      'isEnum': `${field} должно быть одним из допустимых значений`,
      'isNumber': `${field} должно быть числом`,
      'isBoolean': `${field} должно быть булевым значением`,
      'isDate': `${field} должно быть датой`,
      'isUrl': `${field} должно быть корректным URL`,
      'minLength': `${field} должно содержать минимум символов`,
      'maxLength': `${field} не должно превышать максимальную длину`,
      'min': `${field} должно быть больше или равно минимальному значению`,
      'max': `${field} должно быть меньше или равно максимальному значению`,
      'matches': `${field} должно соответствовать определенному формату`,
      'isArray': `${field} должно быть массивом`,
      'isObject': `${field} должно быть объектом`,
      'isUUID': `${field} должно быть корректным UUID`,
      'isInt': `${field} должно быть целым числом`,
      'isFloat': `${field} должно быть числом с плавающей точкой`,
      'isPositive': `${field} должно быть положительным числом`,
      'isNegative': `${field} должно быть отрицательным числом`,
    };

    return translations[constraint] || `${field} содержит недопустимое значение`;
  }

  private formatValidationErrors(errors: ValidationError[]): Record<string, string> {
    const result: Record<string, string> = {};

    errors.forEach((error) => {
      if (error.constraints) {
        // Берем первое ограничение и переводим его
        const firstConstraint = Object.keys(error.constraints)[0];
        const translatedMessage = this.translateValidationError(
          firstConstraint,
          error.property,
          error.value
        );
        result[error.property] = translatedMessage;
      }

      // Обработка вложенных ошибок
      if (error.children && error.children.length > 0) {
        const nestedErrors = this.formatValidationErrors(error.children);
        Object.assign(result, nestedErrors);
      }
    });

    return result;
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Внутренняя ошибка сервера';
    let validationErrors: Record<string, string> | null = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        
        // Обработка ошибок валидации
        if (responseObj.details && Array.isArray(responseObj.details)) {
          validationErrors = this.formatValidationErrors(responseObj.details);
          message = 'Ошибка валидации данных';
        } else if (responseObj.message && Array.isArray(responseObj.message)) {
          // Старый формат ошибок валидации
          validationErrors = this.formatValidationErrors(responseObj.message);
          message = 'Ошибка валидации данных';
        } else {
          message = responseObj.message || responseObj.error || 'Некорректный запрос';
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse = {
      statusCode: status,
      message,
      ...(validationErrors && { errors: validationErrors }),
    };

    console.error('Exception caught by GlobalExceptionFilter:', {
      status,
      message,
      validationErrors,
      url: request.url,
      method: request.method,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json(errorResponse);
  }
}
