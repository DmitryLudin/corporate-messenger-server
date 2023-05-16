import { Exclude } from 'class-transformer';
import { NamespaceMember } from 'src/modules/namespaces/entities/namespace-member.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['name'])
export class Namespace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  displayName: string;

  @OneToMany(() => NamespaceMember, (member) => member.namespace)
  @Exclude()
  members: NamespaceMember[];
}
