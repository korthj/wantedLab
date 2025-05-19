import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { Board } from './entities/board.entity';
import { KeywordAlertModule } from '../keyword-alert/keyword-alert.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board]),
    KeywordAlertModule,
  ],
  controllers: [BoardController],
  providers: [BoardService],
  exports: [BoardService],
})
export class BoardModule {}
 