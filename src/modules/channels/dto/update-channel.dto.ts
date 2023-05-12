import { IsOptional, IsString } from 'class-validator';

export class UpdateChannelDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  displayName?: string;
}

export class UpdateChannelDtoWithMeta extends UpdateChannelDto {
  @IsString()
  userId: string;
}
