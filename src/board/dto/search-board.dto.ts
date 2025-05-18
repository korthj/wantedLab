import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchBoardDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id?: number;

  @IsOptional()
  @IsString()
  author?: string;
} 