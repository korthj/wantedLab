import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Comment } from '../../comment/entities/comment.entity';
import { Exclude, Expose } from 'class-transformer';

@Entity()
export class Board {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column()
  author: string;

  @Exclude()
  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Exclude()
  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(() => Comment, comment => comment.board)
  comments: Comment[];

  constructor(partial: Partial<Board>) {
    Object.assign(this, partial);
  }
} 