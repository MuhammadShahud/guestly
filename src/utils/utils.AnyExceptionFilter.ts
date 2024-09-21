import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException
} from '@nestjs/common';
import { Response } from 'express';
import { httpErrorHandlingFn, mongoErrorHandlingFn } from './utils.helper';

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let error: { status: string; message: { error: string[] } } = null;
    let httpStatusCode: number = null;
    let data: Object = null;

    if (exception instanceof HttpException) {
      console.log('httpException');
      const errors = exception.getResponse();
      const rs = httpErrorHandlingFn(errors);
      error = rs.error;
      httpStatusCode = rs.httpStatusCode;
      data = rs.data;
    } else if (
      ['MongoServerError', 'ValidationError', 'CastError'].includes(
        exception?.constructor?.name,
      )
    ) {
      console.log('MongoError');
      const rs = mongoErrorHandlingFn(exception);
      error = rs.error;
      httpStatusCode = rs.httpStatusCode;
    } else {
      (error = { status: 'error', message: { error: [exception.message] } }),
        (httpStatusCode = 500);
    }
    console.log(data);
    response.status(httpStatusCode).json({
      ...error,
      statusCode: httpStatusCode,
      ...(httpStatusCode === 402 ? data : {}),
    });
  }
}
