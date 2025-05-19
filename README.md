# Board API Project

게시판 API 서버 프로젝트입니다. 게시물, 댓글, 키워드 알림 기능을 제공합니다.

## 기술 스택

- NestJS
- MySQL
- TypeORM
- Yarn Berry

## 설치 및 실행

1. 의존성 설치
```bash
yarn install
```

2. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 입력:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=username
DB_PASSWORD=password
DB_DATABASE=database
```

3. 데이터베이스 스키마 생성
```sql
-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS your_database;
USE your_database;

-- 게시물 테이블
CREATE TABLE board (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 댓글 테이블
CREATE TABLE comment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    board_id INT NOT NULL,
    parent_id INT,
    depth INT DEFAULT 0,
    FOREIGN KEY (board_id) REFERENCES board(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comment(id)
);

-- 키워드 알림 테이블
CREATE TABLE keyword_alert (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author VARCHAR(255) NOT NULL,
    keyword VARCHAR(255) NOT NULL
);
```

4. 서버 실행
```bash
# 로깅x
yarn start

# 로깅o
yarn start:dev

# 로깅x
yarn start:prod
```

## API 엔드포인트

### 게시물 (Boards)

#### 게시물 작성
- **POST** `/boards`
- Request Body
```json
{
    "title": "게시물 제목",
    "content": "게시물 내용",
    "author": "작성자",
    "password": "비밀번호"
}
```

#### 게시물 목록 조회
- **GET** `/boards`
- Query Parameters
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 10)

#### 게시물 검색
- **GET** `/boards/search`
- Query Parameters
  - `author`: 작성자 검색
  - `id`: 게시물 ID
  - `page`: 페이지 번호
  - `limit`: 페이지당 항목 수

#### 게시물 상세 조회
- **GET** `/boards/:id`

#### 게시물 수정
- **PATCH** `/boards/:id`
- Request Body
```json
{
    "title": "수정된 제목",
    "content": "수정된 내용",
    "password": "기존 비밀번호"
}
```

#### 게시물 삭제
- **DELETE** `/boards/:id`
- Request Body
```json
{
    "password": "기존 비밀번호"
}
```

### 댓글 (Comments)

#### 댓글 작성
- **POST** `/comments`
- Request Body
```json
{
    "content": "댓글 내용",
    "author": "작성자",
    "boardId": 1,
    "parentId": null  // 대댓글인 경우 부모 댓글 ID
}
```

#### 게시물의 댓글 목록 조회
- **GET** `/comments/board/:boardId?page=1&limit=10`
- Query Parameters
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 10)

## 응답 형식

### 성공 응답
```json
// 게시물 목록
{
    "items": [
        {
            "title": "게시물 제목",
            "content": "게시물 내용",
            "author": "작성자",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "comments": []
        }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
}

// 게시물 상세 (댓글 포함)
{
    "title": "게시물 제목",
    "content": "게시물 내용",
    "author": "작성자",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "comments": [
        {
            "content": "댓글 내용",
            "author": "댓글 작성자",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "children": [
                {
                    "content": "대댓글 내용",
                    "author": "대댓글 작성자",
                    "createdAt": "2024-01-01T00:00:00.000Z"
                }
            ]
        }
    ]
}
```

## 편의사항
1. 작성자는 동명이인이 없음.
2. 암호 또한 평문으로 저장.(필요하다면 키 스트레칭과 솔트 기법 적용)
3. 키워드 알림은 게시물 제목/내용, 댓글 내용에 매칭. 대소문자 구분x