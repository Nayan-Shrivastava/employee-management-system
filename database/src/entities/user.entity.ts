import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsIn } from 'class-validator';

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @IsIn(['EMPLOYEE', 'ADMIN'])
  role: string;
}
