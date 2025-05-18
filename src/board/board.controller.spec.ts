import { Test, TestingModule } from '@nestjs/testing';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';

describe('BoardController', () => {
  let controller: BoardController;
  let service: BoardService;

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

  const mockBoardService = {
    create: jest.fn().mockImplementation(dto => Promise.resolve({ id: 1, ...dto })),
    findAll: jest.fn().mockResolvedValue([mockBoard]),
    findOne: jest.fn().mockResolvedValue(mockBoard),
    update: jest.fn().mockImplementation((id, dto) => Promise.resolve({ id, ...dto })),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
      ],
    }).compile();

    controller = module.get<BoardController>(BoardController);
    service = module.get<BoardService>(BoardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a board', async () => {
      const createBoardDto = {
        title: 'Test Title',
        content: 'Test Content',
        author: 'Test Author',
        password: 'testpass',
      };

      const result = await controller.create(createBoardDto);
      expect(result).toEqual({ id: 1, ...createBoardDto });
      expect(service.create).toHaveBeenCalledWith(createBoardDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of boards', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockBoard]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a board', async () => {
      const result = await controller.findOne(1);
      expect(result).toEqual(mockBoard);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a board', async () => {
      const updateBoardDto = {
        title: 'Updated Title',
        content: 'Updated Content',
        password: 'testpass',
      };

      const result = await controller.update(1, updateBoardDto);
      expect(result).toEqual({ id: 1, ...updateBoardDto });
      expect(service.update).toHaveBeenCalledWith(1, updateBoardDto);
    });
  });

  describe('remove', () => {
    it('should remove a board', async () => {
      await controller.remove(1, 'testpass');
      expect(service.remove).toHaveBeenCalledWith(1, 'testpass');
    });
  });
});
