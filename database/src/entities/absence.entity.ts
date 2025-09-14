import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AbsenceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity()
export class AbsenceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reason: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({
    type: 'text',
    default: AbsenceStatus.PENDING,
  })
  status: string;

  @ManyToOne(() => User, (user) => user.id, { eager: true })
  employee: User;

  @CreateDateColumn()
  createdAt: Date;

  // Helper methods to maintain type safety
  setStatus(status: AbsenceStatus): void {
    this.status = status;
  }

  getStatus(): AbsenceStatus {
    return this.status as AbsenceStatus;
  }

  isPending(): boolean {
    return this.status === AbsenceStatus.PENDING;
  }

  isApproved(): boolean {
    return this.status === AbsenceStatus.APPROVED;
  }

  isRejected(): boolean {
    return this.status === AbsenceStatus.REJECTED;
  }
}
