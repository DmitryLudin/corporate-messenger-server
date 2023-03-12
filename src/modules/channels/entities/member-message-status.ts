import { Exclude } from 'class-transformer';
import { ChannelMember } from 'src/modules/channels/entities/member.entity';
import { ChannelMessage } from 'src/modules/channels/entities/message.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class ChannelMemberMessageStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  isRead: boolean;

  @ManyToOne(() => ChannelMember)
  @JoinColumn({ name: 'memberId' })
  member: ChannelMember;

  @Column()
  @Exclude()
  memberId: string;

  @ManyToOne(() => ChannelMessage)
  @JoinColumn({ name: 'messageId' })
  message: ChannelMessage;

  @Column()
  @Exclude()
  messageId: string;
}
