import { Exclude } from 'class-transformer';
import { Min } from 'class-validator';
import { ChannelMember } from 'src/modules/channels/entities/channel-member.entity';
import { ChannelStatus } from 'src/modules/channels/entities/channel-status.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  OneToMany,
} from 'typeorm';

@Entity()
@Unique(['name', 'namespaceId'])
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  namespaceId: string;

  @Column({ nullable: true })
  displayName?: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  @Min(0, { message: 'Value cannot be less than 0' })
  membersCount: number;

  @OneToMany(() => ChannelMember, (channelMember) => channelMember.channel)
  @Exclude()
  members: ChannelMember[];

  // Связь One-to-Many с сущностью "Статус канала для пользователя" (ChannelStatus)
  @OneToMany(() => ChannelStatus, (channelStatus) => channelStatus.channel)
  @Exclude()
  statuses: ChannelStatus[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
