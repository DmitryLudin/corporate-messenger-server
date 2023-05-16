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
  id: string;

  @ManyToOne(() => Namespace, (namespace) => namespace.members, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn({ name: 'namespaceId' })
  namespace: Namespace;

  @Column()
  @Exclude()
  namespaceId: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @Exclude()
  userId: string;
}
