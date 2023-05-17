import { IsString } from 'class-validator';

export class JoinNamespaceDto {
  @IsString()
  namespaceName: string;
}

export class JoinNamespaceTransactionDto {
  @IsString()
  namespaceId: string;

  @IsString()
  userId: string;

  @IsString()
  channelId: string;
}
