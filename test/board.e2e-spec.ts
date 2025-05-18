import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('BoardController (e2e)', () => {
  let app: INestApplication;
  let createdBoardId: number;
  const testBoard = {
    title: 'Test Title',
    content: 'Test Content',
    author: 'Test Author',
    password: 'testpass',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'mysql',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: true,
          }),
          inject: [ConfigService],
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/boards (POST)', () => {
    return request(app.getHttpServer())
      .post('/boards')
      .send(testBoard)
      .expect(201)
      .expect(res => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe(testBoard.title);
        createdBoardId = res.body.id;
      });
  });

  it('/boards (GET)', () => {
    return request(app.getHttpServer())
      .get('/boards')
      .expect(200)
      .expect(res => {
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('/boards/:id (GET)', () => {
    return request(app.getHttpServer())
      .get(`/boards/${createdBoardId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.id).toBe(createdBoardId);
        expect(res.body.title).toBe(testBoard.title);
      });
  });

  it('/boards/:id (PATCH)', () => {
    const updateData = {
      title: 'Updated Title',
      content: 'Updated Content',
      password: testBoard.password,
    };

    return request(app.getHttpServer())
      .patch(`/boards/${createdBoardId}`)
      .send(updateData)
      .expect(200)
      .expect(res => {
        expect(res.body.title).toBe(updateData.title);
        expect(res.body.content).toBe(updateData.content);
      });
  });

  it('/boards/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete(`/boards/${createdBoardId}`)
      .send({ password: testBoard.password })
      .expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
}); 