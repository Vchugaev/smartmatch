# Storage API Documentation

## Обзор

Система хранения файлов использует MinIO S3-совместимое хранилище для загрузки и управления изображениями и документами.

## Конфигурация

### Переменные окружения

Добавьте следующие переменные в ваш `.env` файл:

```env
# MinIO Storage Configuration
MINIO_ENDPOINT="vchugaev.ru"
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY="admin"
MINIO_SECRET_KEY="SuperStrongPassword123"
MINIO_BASE_URL="https://vchugaev.ru"
```

## API Endpoints

### 1. Загрузка аватара пользователя

**POST** `/storage/upload/avatar`

Загружает аватар для любого типа пользователя.

**Параметры:**
- `file` (multipart/form-data): Файл изображения

**Ограничения:**
- Размер: максимум 5MB
- Типы файлов: JPEG, PNG, GIF, WebP

**Ответ:**
```json
{
  "success": true,
  "url": "https://vchugaev.ru/smartmatch/avatars/uuid.jpg",
  "message": "Avatar uploaded successfully"
}
```

### 2. Загрузка логотипа университета

**POST** `/storage/upload/university-logo`

Загружает логотип для университета. Доступно только для пользователей с ролями UNIVERSITY и ADMIN.

**Параметры:**
- `file` (multipart/form-data): Файл изображения

**Ограничения:**
- Размер: максимум 2MB
- Типы файлов: JPEG, PNG, GIF, WebP, SVG

**Ответ:**
```json
{
  "success": true,
  "url": "https://vchugaev.ru/smartmatch/university-logos/uuid.png",
  "message": "University logo uploaded successfully"
}
```

### 3. Загрузка резюме

**POST** `/storage/upload/resume`

Загружает резюме кандидата. Доступно только для пользователей с ролями CANDIDATE и ADMIN.

**Параметры:**
- `file` (multipart/form-data): Файл документа

**Ограничения:**
- Размер: максимум 10MB
- Типы файлов: PDF, DOC, DOCX

**Ответ:**
```json
{
  "success": true,
  "url": "https://vchugaev.ru/smartmatch/resumes/uuid.pdf",
  "message": "Resume uploaded successfully"
}
```

### 4. Удаление файла

**DELETE** `/storage/file/:objectName`

Удаляет файл из хранилища.

**Параметры:**
- `objectName` (path): Имя объекта в хранилище

**Ответ:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### 5. Получение предварительного URL

**GET** `/storage/presigned-url`

Генерирует предварительный URL для доступа к файлу.

**Параметры запроса:**
- `objectName` (query): Имя объекта
- `bucket` (query, optional): Имя bucket'а (по умолчанию: smartmatch)
- `expires` (query, optional): Время жизни URL в секундах (по умолчанию: 604800 - 7 дней)

**Ответ:**
```json
{
  "success": true,
  "url": "https://vchugaev.ru/smartmatch/avatars/uuid.jpg?X-Amz-Algorithm=..."
}
```

### 6. Список файлов (только для админов)

**GET** `/storage/files`

Получает список файлов в bucket'е. Доступно только для пользователей с ролью ADMIN.

**Параметры запроса:**
- `bucket` (query, optional): Имя bucket'а (по умолчанию: smartmatch)
- `prefix` (query, optional): Префикс для фильтрации файлов

**Ответ:**
```json
{
  "success": true,
  "files": [
    {
      "name": "avatars/uuid.jpg",
      "size": 12345,
      "lastModified": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Структура хранилища

Файлы организованы в следующие папки:

- `avatars/` - Аватары пользователей
- `university-logos/` - Логотипы университетов
- `resumes/` - Резюме кандидатов

## Обновление профилей

После загрузки файла, используйте полученный URL для обновления профиля:

### HR Profile
```json
{
  "avatarUrl": "https://vchugaev.ru/smartmatch/avatars/uuid.jpg"
}
```

### Candidate Profile
```json
{
  "avatarUrl": "https://vchugaev.ru/smartmatch/avatars/uuid.jpg",
  "resumeUrl": "https://vchugaev.ru/smartmatch/resumes/uuid.pdf"
}
```

### University Profile
```json
{
  "logoUrl": "https://vchugaev.ru/smartmatch/university-logos/uuid.png"
}
```

## Аутентификация

Все endpoints требуют JWT токен в заголовке Authorization:

```
Authorization: Bearer <your-jwt-token>
```

## Обработка ошибок

API возвращает стандартные HTTP коды ошибок:

- `400 Bad Request` - Неверные параметры или файл
- `401 Unauthorized` - Отсутствует или неверный токен
- `403 Forbidden` - Недостаточно прав доступа
- `413 Payload Too Large` - Файл слишком большой
- `415 Unsupported Media Type` - Неподдерживаемый тип файла
- `500 Internal Server Error` - Ошибка сервера

## Примеры использования

### Загрузка аватара с помощью curl

```bash
curl -X POST \
  -H "Authorization: Bearer <your-token>" \
  -F "file=@avatar.jpg" \
  http://localhost:3000/storage/upload/avatar
```

### Загрузка логотипа университета

```bash
curl -X POST \
  -H "Authorization: Bearer <your-token>" \
  -F "file=@logo.png" \
  http://localhost:3000/storage/upload/university-logo
```

### Обновление профиля с новым аватаром

```bash
curl -X PATCH \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"avatarUrl": "https://vchugaev.ru/smartmatch/avatars/uuid.jpg"}' \
  http://localhost:3000/profiles/candidate
```
