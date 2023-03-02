import { Channel } from 'src/modules/channels/entities/channel.entity';
import { User } from 'src/modules/users/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  channelId: number;

  @ManyToOne(() => Channel)
  channel: Channel;

  @Column()
  memberId: number;

  @ManyToOne(() => User)
  member: User;
}
