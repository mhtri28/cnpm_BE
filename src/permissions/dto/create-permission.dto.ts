import { IsNotEmpty, Length } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty()
  @Length(1, 50)
  name: string;

  @IsNotEmpty()
  @Length(1, 100)
  description: string;
}
