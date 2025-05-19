import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './entities/comment.entity';
import { Board } from '../board/entities/board.entity';
import { KeywordAlertModule } from '../keyword-alert/keyword-alert.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Board]),
    KeywordAlertModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
