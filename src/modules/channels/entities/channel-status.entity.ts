import { Exclude } from 'class-transformer';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { User } from 'src/modules/users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class ChannelStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  namespaceId: string;

  @Column({ default: false, type: 'boolean' })
  isUnread: boolean;

  @Column({ type: 'bigint' })
  lastReadTimestamp: number;

  @ManyToOne(() => Channel, (channel) => channel.statuses, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn({ name: 'channelId' })
  channel: Channel;

  @Column()
  @Exclude()
  channelId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @Exclude()
  userId: string;
}
