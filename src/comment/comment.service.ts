import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Board } from '../board/entities/board.entity';
import { PageDto } from '../common/dto/page.dto';
import { KeywordAlertService } from '../keyword-alert/keyword-alert.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private keywordAlertService: KeywordAlertService,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const board = await this.boardRepository.findOne({
      where: { id: createCommentDto.boardId },
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${createCommentDto.boardId} not found`);
    }

    const comment = new Comment({
      ...createCommentDto,
      board,
    });

    if (createCommentDto.parentId) {
      const parent = await this.commentRepository.findOne({
        where: { id: createCommentDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException(`Parent comment with ID ${createCommentDto.parentId} not found`);
      }

      if (parent.depth >= 1) {
        throw new BadRequestException('Cannot create a reply to a reply. Only one level of replies is allowed.');
      }

      comment.parent = parent;
      comment.depth = parent.depth + 1;
    } else {
      comment.depth = 0;
    }

    // 댓글 작성 시 키워드 알림 함수 호출
    await this.keywordAlertService.checkCommentContent(createCommentDto.content, createCommentDto.author);
    
    return this.commentRepository.save(comment);
  }

  async findAll(boardId: number, pageDto: PageDto): Promise<{ items: Comment[]; total: number; page: number; limit: number }> {
    const skip = (pageDto.page - 1) * pageDto.limit;
    const take = pageDto.limit;

    const [items, total] = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.children', 'children')
      .where('comment.boardId = :boardId', { boardId })
      .andWhere('comment.parentId IS NULL')  // 최상위 댓글만 가져옴
      .orderBy('comment.createdAt', 'ASC')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return {
      items,
      total,
      page: pageDto.page,
      limit: pageDto.limit
    };
  }
}
