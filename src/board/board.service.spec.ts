import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardService } from './board.service';
import { Board } from './entities/board.entity';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('BoardService', () => {
  let service: BoardService;
  let repository: Repository<Board>;

  const mockBoard = {
    id: 1,
    title: 'Test Title',
    content: 'Test Content',
    author: 'Test Author',
    password: 'testpass',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  };

  const mockRepository = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(board => Promise.resolve({ id: 1, ...board })),
    find: jest.fn().mockResolvedValue([mockBoard]),
    findOne: jest.fn().mockResolvedValue(mockBoard),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: getRepositoryToken(Board),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
    repository = module.get<Repository<Board>>(getRepositoryToken(Board));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a board', async () => {
      const createBoardDto = {
        title: 'Test Title',
        content: 'Test Content',
        author: 'Test Author',
        password: 'testpass',
      };

      const result = await service.create(createBoardDto);
      expect(result).toEqual({ id: 1, ...createBoardDto });
      expect(repository.create).toHaveBeenCalledWith(createBoardDto);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of boards', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockBoard]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { isDeleted: false },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a board', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockBoard);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1, isDeleted: false },
      });
    });

    it('should throw NotFoundException when board not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a board', async () => {
      const updateBoardDto = {
        title: 'Updated Title',
        content: 'Updated Content',
        password: 'testpass',
      };

      const result = await service.update(1, updateBoardDto);
      expect(result).toBeDefined();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const updateBoardDto = {
        title: 'Updated Title',
        content: 'Updated Content',
        password: 'wrongpass',
      };

      await expect(service.update(1, updateBoardDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('remove', () => {
    it('should soft delete a board', async () => {
      await service.remove(1, 'testpass');
      expect(repository.save).toHaveBeenCalledWith({
        ...mockBoard,
        isDeleted: true,
      });
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      await expect(service.remove(1, 'wrongpass')).rejects.toThrow(UnauthorizedException);
    });
  });
});
