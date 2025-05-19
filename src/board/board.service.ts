import { Injectable, NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { SearchBoardDto } from './dto/search-board.dto';
import { PageDto } from '../common/dto/page.dto';
import { KeywordAlertService } from '../keyword-alert/keyword-alert.service';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private keywordAlertService: KeywordAlertService,
  ) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    try {
      const board = new Board(createBoardDto);
      
      // 게시물 작성 시 키워드 알림 함수 호출
      await this.keywordAlertService.checkBoardContent(
        createBoardDto.title,
        createBoardDto.content,
        createBoardDto.author
      );
      
      return await this.boardRepository.save(board);
    } catch (error) {
      throw new InternalServerErrorException(
        `게시물 생성 중 오류가 발생했습니다: ${error.message}`
      );
    }
  }

  async findAll(pageDto: PageDto): Promise<{ items: Board[]; total: number; page: number; limit: number }> {
    try {
      const skip = (pageDto.page - 1) * pageDto.limit;
      const take = pageDto.limit;

      const [items, total] = await this.boardRepository
        .createQueryBuilder('board')
        .where('board.isDeleted = :isDeleted', { isDeleted: false })
        .orderBy('board.createdAt', 'DESC')
        .skip(skip)
        .take(take)
        .getManyAndCount();

      return {
        items,
        total,
        page: pageDto.page,
        limit: pageDto.limit
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `게시물 목록 조회 중 오류가 발생했습니다: ${error.message}`
      );
    }
  }

  async search(searchBoardDto: SearchBoardDto, pageDto: PageDto): Promise<{ items: Board[]; total: number; page: number; limit: number }> {
    const skip = (pageDto.page - 1) * pageDto.limit;
    const take = pageDto.limit;

    const queryBuilder = this.boardRepository
      .createQueryBuilder('board')
      .where('board.isDeleted = :isDeleted', { isDeleted: false });

    if (searchBoardDto.id) {
      queryBuilder.andWhere('board.id = :id', { id: searchBoardDto.id });
    }

    if (searchBoardDto.author) {
      queryBuilder.andWhere('board.author LIKE :author', { author: `%${searchBoardDto.author}%` });
    }

    const [items, total] = await queryBuilder
      .orderBy('board.createdAt', 'DESC')
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

  async findOne(id: number): Promise<Board> {
    try {
      const board = await this.boardRepository
        .createQueryBuilder('board')
        .leftJoinAndSelect('board.comments', 'comments')
        .leftJoinAndSelect('comments.children', 'replies')
        .where('board.id = :id', { id })
        .andWhere('board.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('comments.parentId IS NULL')
        .orderBy('comments.createdAt', 'ASC')
        .addOrderBy('replies.createdAt', 'ASC')
        .getOne();
      
      if (!board) {
        throw new NotFoundException(`게시물 ID ${id}를 찾을 수 없습니다.`);
      }
      
      return board;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `게시물 조회 중 오류가 발생했습니다: ${error.message}`
      );
    }
  }

  async update(id: number, updateBoardDto: UpdateBoardDto): Promise<Board> {
    try {
      const board = await this.findOne(id);
      
      if (board.password !== updateBoardDto.password) {
        throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
      }
      
      Object.assign(board, updateBoardDto);
      return await this.boardRepository.save(board);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `게시물 수정 중 오류가 발생했습니다: ${error.message}`
      );
    }
  }

  async remove(id: number, password: string): Promise<void> {
    try {
      const board = await this.findOne(id);
      
      if (board.password !== password) {
        throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
      }
      
      await this.boardRepository
        .createQueryBuilder()
        .update(Board)
        .set({ isDeleted: true })
        .where('id = :id', { id })
        .execute();
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `게시물 삭제 중 오류가 발생했습니다: ${error.message}`
      );
    }
  }
}
