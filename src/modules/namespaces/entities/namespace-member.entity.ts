import { Exclude } from 'class-transformer';
import { Namespace } from 'src/modules/namespaces/entities/namespace.entity';
import { User } from 'src/modules/users/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class NamespaceMember {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => Namespace, { onDelete: 'CASCADE', cascade: true })
  @JoinColumn({ name: 'namespaceId' })
  namespace: Namespace;

  @Column()
  @Exclude()
  namespaceId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @Exclude()
  userId: string;
}
