import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Board } from '../board/entities/board.entity';
import { PageDto } from '../common/dto/page.dto';
import { KeywordAlertService } from '../keyword-alert/keyword-alert.service';

class CommentResponse {
  content: string;
  author: string;
  createdAt: Date;
  replies?: CommentResponse[];
}

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
    try {
      const board = await this.boardRepository.findOne({
        where: { id: createCommentDto.boardId },
      });

      if (!board) {
        throw new NotFoundException(`게시물 ID ${createCommentDto.boardId}를 찾을 수 없습니다.`);
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
          throw new NotFoundException(`부모 댓글 ID ${createCommentDto.parentId}를 찾을 수 없습니다.`);
        }

        if (parent.depth >= 1) {
          throw new BadRequestException('대댓글에는 답글을 달 수 없습니다. 댓글의 깊이는 1단계로 제한됩니다.');
        }

        comment.parent = parent;
        comment.depth = parent.depth + 1;
      } else {
        comment.depth = 0;
      }

      await this.keywordAlertService.checkCommentContent(createCommentDto.content, createCommentDto.author);
      
      return await this.commentRepository.save(comment);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `댓글 생성 중 오류가 발생했습니다: ${error.message}`
      );
    }
  }

  private mapToResponse(comment: Comment): CommentResponse {
    const response: CommentResponse = {
      content: comment.content,
      author: comment.author,
      createdAt: comment.createdAt,
    };

    if (comment.children && comment.children.length > 0) {
      response.replies = comment.children.map(child => this.mapToResponse(child));
    }

    return response;
  }

  async findAll(boardId: number, pageDto: PageDto): Promise<{ items: CommentResponse[]; total: number; page: number; limit: number }> {
    try {
      const skip = (pageDto.page - 1) * pageDto.limit;
      const take = pageDto.limit;

      const [comments, total] = await this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.children', 'children')
        .where('comment.boardId = :boardId', { boardId })
        .andWhere('comment.parentId IS NULL')
        .orderBy('comment.createdAt', 'ASC')
        .addOrderBy('children.createdAt', 'ASC')
        .skip(skip)
        .take(take)
        .getManyAndCount();

      const items = comments.map(comment => this.mapToResponse(comment));

      return {
        items,
        total,
        page: pageDto.page,
        limit: pageDto.limit
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `댓글 목록 조회 중 오류가 발생했습니다: ${error.message}`
      );
    }
  }
}
