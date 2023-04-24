import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Namespace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  displayName: string;
}
