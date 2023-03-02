import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelMessageDto } from './create-message.dto';

export class UpdateChannelMessageDto extends PartialType(
  CreateChannelMessageDto,
) {
  id: number;
}
