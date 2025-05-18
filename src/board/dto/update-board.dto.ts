import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateBoardDto {
  @IsString()
  @MinLength(2)
  title?: string;

  @IsString()
  content?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  password: string;
} 