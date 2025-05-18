import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Board } from '../../board/entities/board.entity';
import { Exclude, Type } from 'class-transformer';

@Entity()
export class Comment {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column()
  author: string;

  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @Column({ default: false })
  isDeleted: boolean;

  @Exclude()
  @ManyToOne(() => Board, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Exclude()
  @Column()
  boardId: number;

  @Exclude()
  @ManyToOne(() => Comment, comment => comment.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Comment;

  @Exclude()
  @Column({ nullable: true })
  parentId: number;

  @Type(() => Comment)
  @OneToMany(() => Comment, comment => comment.parent)
  children: Comment[];

  @Exclude()
  @Column({ default: 0 })
  depth: number;

  constructor(partial: Partial<Comment>) {
    Object.assign(this, partial);
  }
} 