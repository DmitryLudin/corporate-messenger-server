import { IsString } from 'class-validator';

export class CreateNamespaceDto {
  @IsString()
  name: string;

  @IsString()
  displayName: string;
}

export class CreateNamespaceWithUserIdDto extends CreateNamespaceDto {
  @IsString()
  userId: string;
}
