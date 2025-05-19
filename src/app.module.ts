import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { BoardModule } from './board/board.module';
import { CommentModule } from './comment/comment.module';
import { KeywordAlertModule } from './keyword-alert/keyword-alert.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],  
    }),
    BoardModule,
    CommentModule,
    KeywordAlertModule,
  ],
})
export class AppModule {}
