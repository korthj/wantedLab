import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  author: string;

  @IsNumber()
  boardId: number;

  @IsOptional()
  @IsNumber()
  parentId?: number;
} 