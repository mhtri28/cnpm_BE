import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTableDto {
  @ApiProperty({
    example: 'Table 1',
    description: 'Tên bàn',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
