import { Exclude } from 'class-transformer';
import { User } from 'src/modules/users/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Channel } from './channel.entity';

@Entity()
export class ChannelMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  @Exclude()
  authorId: string;

  @ManyToOne(() => Channel, { eager: true })
  @JoinColumn({ name: 'channelId' })
  channel: Channel;

  @Column()
  @Exclude()
  channelId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
