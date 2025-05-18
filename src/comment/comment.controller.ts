import { Controller, Get, Post, Body, Param, ParseIntPipe, UseInterceptors, ClassSerializerInterceptor, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { PageDto } from '../common/dto/page.dto';

@Controller('comments')
@UseInterceptors(ClassSerializerInterceptor)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto): Promise<Comment> {
    return this.commentService.create(createCommentDto);
  }

  @Get('board/:boardId')
  findAll(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query() pageDto: PageDto
  ) {
    return this.commentService.findAll(boardId, pageDto);
  }
}
