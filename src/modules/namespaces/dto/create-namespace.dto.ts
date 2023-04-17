import { IsString } from 'class-validator';

export class CreateNamespaceDto {
  @IsString()
  userId: string;

  @IsString()
  name: string;

  @IsString()
  displayName: string;
}
