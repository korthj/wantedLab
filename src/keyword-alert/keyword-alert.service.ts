import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeywordAlert } from './entities/keyword-alert.entity';

interface ContentToCheck {
  title?: string;
  content: string;
  author: string;
}

@Injectable()
export class KeywordAlertService {
  constructor(
    @InjectRepository(KeywordAlert)
    private keywordAlertRepository: Repository<KeywordAlert>,
  ) {}

  /**
   * 게시물 및 댓글 작성 시 등록된 키워드 확인 및 알림 함수
   */
  private async checkAndNotify(contentToCheck: ContentToCheck): Promise<void> {
    const keywordAlerts = await this.keywordAlertRepository
      .createQueryBuilder('alert')
      .select(['alert.author', 'alert.keyword'])
      .getMany();

    for (const alert of keywordAlerts) {
      if (alert.author === contentToCheck.author) {
        continue;
      }

      const regex = new RegExp(alert.keyword, 'i');
      
      if (contentToCheck.title && regex.test(contentToCheck.title)) {
        console.log(`Sending notification to ${alert.author} for keyword "${alert.keyword}" in title: "${contentToCheck.title}" from ${contentToCheck.author}`);
        // 이하 실제 알림 전송 함수 호출
      }

      // 내용 확인
      if (regex.test(contentToCheck.content)) {
        console.log(`Sending notification to ${alert.author} for keyword "${alert.keyword}" in content: "${contentToCheck.content}" from ${contentToCheck.author}`);
        // 이하 실제 알림 전송 함수 호출
      }
    }
  }

  async checkBoardContent(title: string, content: string, author: string): Promise<void> {
    await this.checkAndNotify({ title, content, author });
  }

  async checkCommentContent(content: string, author: string): Promise<void> {
    await this.checkAndNotify({ content, author });
  }
} 