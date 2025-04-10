import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface TypeORMError extends QueryFailedError {
  code?: string;
  sqlMessage?: string;
}

@Catch(QueryFailedError)
export class SqlExceptionsFilter implements ExceptionFilter {
  catch(exception: TypeORMError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.BAD_REQUEST;
    const errorResponse = {
      statusCode: status,
      message: this.getErrorMessage(exception),
      error: 'Bad Request',
    };

    response.status(status).json(errorResponse);
  }

  private getErrorMessage(exception: TypeORMError): string {
    if (exception.code === 'ER_DUP_ENTRY') {
      const message = exception.message || exception.sqlMessage || '';

      // Trích xuất field gây duplicate từ message lỗi
      const field = this.extractFieldFromDuplicateMessage(message);

      if (field === 'name') {
        return 'Tên đồ uống đã tồn tại. Vui lòng chọn tên khác.';
      }

      return 'Dữ liệu bị trùng lặp. Vui lòng kiểm tra lại thông tin.';
    }

    return 'Lỗi cơ sở dữ liệu. Vui lòng thử lại sau.';
  }

  private extractFieldFromDuplicateMessage(message: string): string | null {
    // Trích xuất field từ message thông báo lỗi
    const keyMatch = message.match(/IDX_([a-zA-Z0-9_]+)/);
    if (keyMatch && keyMatch[1]) {
      // Dựa vào tên index để xác định field
      // Ví dụ: IDX_b197b779114d6bc7abd36a8109 là chỉ mục cho trường name
      return 'name';
    }
    return null;
  }
}
