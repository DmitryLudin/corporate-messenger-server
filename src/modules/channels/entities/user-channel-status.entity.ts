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
export class UserChannelStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  isUnread: boolean;

  @Column({ nullable: true })
  lastReadTimestamp?: number;

  @ManyToOne(() => Channel, { onDelete: 'CASCADE', cascade: true })
  @JoinColumn({ name: 'channelId' })
  channel: Channel;

  @Column()
  @Exclude()
  channelId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @Exclude()
  userId: string;
}
