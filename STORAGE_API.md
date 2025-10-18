# Storage API Endpoints

API для работы с S3-совместимым хранилищем через MinIO.

## Базовый URL
```
http://localhost:3000/storage
```

## Endpoints

### 1. Загрузка файла
**POST** `/storage/upload`

Загружает файл в S3 хранилище.

**Параметры:**
- `file` (multipart/form-data) - файл для загрузки
- `path` (опционально) - путь в хранилище

**Пример запроса:**
```bash
curl -X POST http://localhost:3000/storage/upload \
  -F "file=@/path/to/your/file.jpg" \
  -F "path=images"
```

**Ответ:**
```json
{
  "success": true,
  "fileName": "images/photo.jpg",
  "originalName": "photo.jpg",
  "size": 1024000,
  "mimeType": "image/jpeg",
  "presignedUrl": "https://storage.vchugaev.ru:443/smartmatch/images/photo.jpg?X-Amz-Algorithm=..."
}
```

### 2. Скачивание файла
**GET** `/storage/download/:fileName`

Скачивает файл из хранилища.

**Параметры:**
- `fileName` - имя файла в хранилище

**Пример запроса:**
```bash
curl -X GET http://localhost:3000/storage/download/images/photo.jpg \
  --output photo.jpg
```

### 3. Получение информации о файле
**GET** `/storage/info/:fileName`

Получает метаданные файла.

**Параметры:**
- `fileName` - имя файла в хранилище

**Пример запроса:**
```bash
curl -X GET http://localhost:3000/storage/info/images/photo.jpg
```

**Ответ:**
```json
{
  "success": true,
  "fileName": "images/photo.jpg",
  "size": 1024000,
  "lastModified": "2024-01-15T10:30:00.000Z",
  "etag": "\"abc123def456\"",
  "metaData": {
    "content-type": "image/jpeg"
  }
}
```

### 4. Список файлов
**GET** `/storage/list`

Получает список файлов в хранилище.

**Параметры тела запроса:**
- `prefix` (опционально) - префикс для фильтрации файлов

**Пример запроса:**
```bash
curl -X GET http://localhost:3000/storage/list \
  -H "Content-Type: application/json" \
  -d '{"prefix": "images/"}'
```

**Ответ:**
```json
{
  "success": true,
  "files": [
    {
      "name": "images/photo1.jpg",
      "size": 1024000,
      "lastModified": "2024-01-15T10:30:00.000Z",
      "etag": "\"abc123def456\""
    },
    {
      "name": "images/photo2.jpg",
      "size": 2048000,
      "lastModified": "2024-01-15T11:00:00.000Z",
      "etag": "\"def456ghi789\""
    }
  ]
}
```

### 5. Получение presigned URL для скачивания
**GET** `/storage/presigned/:fileName`

Генерирует временную ссылку для скачивания файла.

**Параметры:**
- `fileName` - имя файла в хранилище

**Параметры тела запроса:**
- `expiry` (опционально) - время жизни ссылки в секундах (по умолчанию 3600)

**Пример запроса:**
```bash
curl -X GET http://localhost:3000/storage/presigned/images/photo.jpg \
  -H "Content-Type: application/json" \
  -d '{"expiry": 7200}'
```

**Ответ:**
```json
{
  "success": true,
  "url": "https://storage.vchugaev.ru:9001/smartmatch/images/photo.jpg?X-Amz-Algorithm=..."
}
```

### 6. Получение presigned URL для загрузки
**GET** `/storage/presigned-upload/:fileName`

Генерирует временную ссылку для загрузки файла.

**Параметры:**
- `fileName` - имя файла в хранилище

**Параметры тела запроса:**
- `expiry` (опционально) - время жизни ссылки в секундах (по умолчанию 3600)

**Пример запроса:**
```bash
curl -X GET http://localhost:3000/storage/presigned-upload/images/new-photo.jpg \
  -H "Content-Type: application/json" \
  -d '{"expiry": 7200}'
```

**Ответ:**
```json
{
  "success": true,
  "url": "https://storage.vchugaev.ru:9001/smartmatch/images/new-photo.jpg?X-Amz-Algorithm=..."
}
```

### 7. Удаление файла
**DELETE** `/storage/:fileName`

Удаляет файл из хранилища.

**Параметры:**
- `fileName` - имя файла в хранилище

**Пример запроса:**
```bash
curl -X DELETE http://localhost:3000/storage/images/photo.jpg
```

**Ответ:**
```json
{
  "success": true,
  "message": "File images/photo.jpg deleted successfully"
}
```

## Коды ошибок

- `400 Bad Request` - Неверные параметры запроса
- `404 Not Found` - Файл не найден
- `500 Internal Server Error` - Внутренняя ошибка сервера

## Конфигурация MinIO

Сервис настроен для подключения к MinIO серверу:
- **Endpoint:** `storage.vchugaev.ru`
- **Port:** `9001`
- **SSL:** `true`
- **Bucket:** `smartmatch`

## Примеры использования

### Загрузка изображения профиля
```bash
curl -X POST http://localhost:3000/storage/upload \
  -F "file=@profile.jpg" \
  -F "path=profiles/user123"
```

### Получение временной ссылки для скачивания
```bash
curl -X GET http://localhost:3000/storage/presigned/profiles/user123/profile.jpg \
  -H "Content-Type: application/json" \
  -d '{"expiry": 3600}'
```

### Удаление файла
```bash
curl -X DELETE http://localhost:3000/storage/profiles/user123/profile.jpg
```