import { Exclude } from 'class-transformer';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { User } from 'src/modules/users/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['channelId', 'userId'])
export class ChannelMember {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  namespaceId: string;

  @ManyToOne(() => Channel, (channel) => channel.members, {
    onDelete: 'CASCADE',
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

  @Column({ default: false })
  isAdmin: boolean;
}
