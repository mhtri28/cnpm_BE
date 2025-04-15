import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh_token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsIm5hbWUiOiJBZG1pbiBVc2VyIiwiZW1haWwiOiJhZG1pbkBjb2ZmZWUuY29tIiwicGhvbmUiOiIwMTIzNDU2Nzg5Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQ0MDEyNzc0LCJleHAiOjE3NDQ2MTc1NzR9.0NBvr0IzFSdF56kQO8H0rrrXTACwp_6qplt7xSOaOZs',
  })
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
