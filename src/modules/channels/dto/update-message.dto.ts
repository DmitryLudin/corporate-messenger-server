import { IsString, MaxLength } from 'class-validator';

export class UpdateChannelMessageDto {
  @IsString()
  id: string;

  @IsString()
  @MaxLength(5000)
  text: string;
}
