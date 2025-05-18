import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Query, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { SearchBoardDto } from './dto/search-board.dto';
import { PageDto } from '../common/dto/page.dto';

@Controller('boards')
@UseInterceptors(ClassSerializerInterceptor)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  /**
   * 게시물 작성
   */
  @Post()
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardService.create(createBoardDto);
  }

  /**
   * 게시물 목록
   */
  @Get()
  findAll(@Query() pageDto: PageDto) {
    return this.boardService.findAll(pageDto);
  }

  /**
   * 게시물 검색
   */
  @Get('search')
  search(
    @Query() searchBoardDto: SearchBoardDto,
    @Query() pageDto: PageDto
  ) {
    return this.boardService.search(searchBoardDto, pageDto);
  }

  /**
   * 게시물 상세
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.boardService.findOne(id);
  }

  /**
   * 게시물 수정
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return this.boardService.update(id, updateBoardDto);
  }

  /**
   * 게시물 삭제
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Body('password') password: string,
  ) {
    return this.boardService.remove(id, password);
  }
}
