import { Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(HttpException)
export class HttpToRpcExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException): Observable<any> {
    const response: any = exception.getResponse();
    const status = exception.getStatus();

    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (typeof response === 'string') {
      message = response;
    } else if (typeof response === 'object') {
      message = response['message'] || message;
      error = response['error'] || error;
    }
    let statusCode = status;
    if (error && typeof error === 'object') {
      statusCode = error ? error['statusCode'] : status;
    }
    return throwError(
      () =>
        new RpcException({
          statusCode,
          message,
          error,
          timestamp: new Date().toISOString(),
        })
    );
  }
}
