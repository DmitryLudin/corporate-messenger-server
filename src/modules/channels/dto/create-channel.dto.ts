import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  name: string;

  @IsString()
  userId: string;

  @IsString()
  namespaceId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsArray()
  @IsOptional()
  members?: string[];
}
