import { IsOptional, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  name: string;

  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  displayName?: string;
}
