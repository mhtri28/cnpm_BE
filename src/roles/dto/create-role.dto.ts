import { IsNotEmpty, Length, IsArray, IsNumber } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @Length(1, 50)
  name: string;

  @IsNotEmpty()
  @Length(1, 100)
  description: string;

  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds: number[];
}
