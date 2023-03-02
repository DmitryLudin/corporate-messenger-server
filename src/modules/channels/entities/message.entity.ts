import { User } from 'src/modules/users/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Channel } from './channel.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  channelId: number;

  @ManyToOne(() => Channel)
  channel: Channel;

  @Column()
  authorId: number;

  @ManyToOne(() => User)
  author: User;

  @Column()
  text: string;

  @CreateDateColumn()
  createdAt: Date;
}
