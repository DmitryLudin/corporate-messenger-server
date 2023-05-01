import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LogInDto {
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
