import { Exclude } from 'class-transformer';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { User } from 'src/modules/users/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class ChannelMember {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Channel, { onDelete: 'CASCADE', cascade: true })
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
