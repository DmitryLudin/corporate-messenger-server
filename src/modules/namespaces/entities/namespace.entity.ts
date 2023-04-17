import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class Namespace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  displayName: string;
}
