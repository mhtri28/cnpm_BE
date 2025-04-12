import { PartialType } from '@nestjs/mapped-types';
import { CreateTableDto } from './create-table.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateTableDto extends PartialType(CreateTableDto) {
  /**
   * Chỉ cho phép cập nhật tên bàn
   */

  @ApiProperty({
    example: 'Bàn 1',
    description: 'Tên bàn',
  })
  @IsString()
  name: string;
}
