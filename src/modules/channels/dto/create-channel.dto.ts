import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsArray()
  @IsOptional()
  members?: Array<string> | undefined;
}

export class CreateChannelWithMetaDto extends CreateChannelDto {
  @IsString()
  namespaceId: string;

  @IsString()
  userId: string;
}
