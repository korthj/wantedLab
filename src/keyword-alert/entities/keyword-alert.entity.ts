import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
//@Index(['author', 'keyword'], { synchronize: false }) 인덱싱하여 개선 가능
export class KeywordAlert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  author: string;

  @Column({ length: 255 })
  keyword: string;
} 