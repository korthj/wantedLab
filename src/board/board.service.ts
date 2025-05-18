import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { SearchBoardDto } from './dto/search-board.dto';
import { PageDto } from '../common/dto/page.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    const board = new Board(createBoardDto);
    return await this.boardRepository.save(board);
  }

  async findAll(pageDto: PageDto): Promise<{ items: Board[]; total: number; page: number; limit: number }> {
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
    const board = await this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.comments', 'comments')
      .where('board.id = :id', { id })
      .andWhere('board.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('comments.createdAt', 'ASC')
      .getOne();
    
    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }
    
    return board;
  }

  async update(id: number, updateBoardDto: UpdateBoardDto): Promise<Board> {
    const board = await this.findOne(id);
    
    if (board.password !== updateBoardDto.password) {
      throw new UnauthorizedException('Invalid password');
    }
    
    const updatedBoard = Object.assign(board, {
      title: updateBoardDto.title || board.title,
      content: updateBoardDto.content || board.content,
    });
    
    return await this.boardRepository.save(updatedBoard);
  }

  async remove(id: number, password: string): Promise<void> {
    const board = await this.findOne(id);
    
    if (board.password !== password) {
      throw new UnauthorizedException('Invalid password');
    }
    
    await this.boardRepository
      .createQueryBuilder()
      .update(Board)
      .set({ isDeleted: true })
      .where('id = :id', { id })
      .execute();
  }
}
