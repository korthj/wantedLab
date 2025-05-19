import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeywordAlert } from './entities/keyword-alert.entity';
import { KeywordAlertService } from './keyword-alert.service';

@Module({
  imports: [TypeOrmModule.forFeature([KeywordAlert])],
  providers: [KeywordAlertService],
  exports: [KeywordAlertService],
})
export class KeywordAlertModule {} 