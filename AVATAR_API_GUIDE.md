# Руководство по API аватарок профилей

## Новые эндпоинты для работы с аватарками

### 1. Загрузка аватарки профиля
**Эндпоинт:** `POST /profiles/avatar/upload`

**Описание:** Загружает аватарку для текущего пользователя

**Параметры:**
- `file` (multipart/form-data) - изображение аватарки
- Требуется авторизация (JWT токен)

**Ограничения:**
- Только изображения (`image/*`)
- Максимальный размер: 10MB
- Один файл за раз

**Пример запроса:**
```bash
curl -X POST http://localhost:3000/profiles/avatar/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@avatar.jpg"
```

**Ответ:**
```json
{
  "success": true,
  "fileName": "avatars/avatar_123456.jpg",
  "avatarUrl": "https://storage.vchugaev.ru/smartmatch/avatars/avatar_123456.jpg?X-Amz-Algorithm=...",
  "message": "Аватарка успешно загружена"
}
```

### 2. Получение аватарки профиля
**Эндпоинт:** `GET /profiles/avatar`

**Описание:** Возвращает файл аватарки текущего пользователя

**Параметры:**
- Требуется авторизация (JWT токен)

**Пример запроса:**
```bash
curl -X GET http://localhost:3000/profiles/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output avatar.jpg
```

**Ответ:** Бинарный файл изображения с соответствующими заголовками

### 3. Получение URL аватарки профиля
**Эндпоинт:** `GET /profiles/avatar/url`

**Описание:** Возвращает presigned URL для доступа к аватарке

**Параметры:**
- Требуется авторизация (JWT токен)

**Пример запроса:**
```bash
curl -X GET http://localhost:3000/profiles/avatar/url \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Ответ:**
```json
{
  "success": true,
  "avatarUrl": "https://storage.vchugaev.ru/smartmatch/avatars/avatar_123456.jpg?X-Amz-Algorithm=...",
  "fileName": "avatars/avatar_123456.jpg"
}
```

**Если аватарка не найдена:**
```json
{
  "success": false,
  "message": "Аватарка не найдена"
}
```

### 4. Удаление аватарки профиля
**Эндпоинт:** `POST /profiles/avatar/delete`

**Описание:** Удаляет аватарку текущего пользователя

**Параметры:**
- Требуется авторизация (JWT токен)

**Пример запроса:**
```bash
curl -X POST http://localhost:3000/profiles/avatar/delete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Ответ:**
```json
{
  "success": true,
  "message": "Аватарка успешно удалена"
}
```

## Особенности для разных типов профилей

### HR профиль
- Аватарка сохраняется в поле `avatarId`
- Эндпоинт: `/profiles/avatar/upload`

### Кандидат
- Аватарка сохраняется в поле `avatarId`
- Эндпоинт: `/profiles/avatar/upload`

### Университет
- Логотип сохраняется в поле `logoId`
- Эндпоинт: `/profiles/avatar/upload` (но сохраняется как логотип)

## Интеграция с профилями

### Получение профиля с URL аватарки
После загрузки аватарки, при получении профиля через стандартные эндпоинты:
- `GET /profiles/hr`
- `GET /profiles/candidate` 
- `GET /profiles/university`

В ответе будет включено поле `avatarId` с именем файла. Для получения URL аватарки используйте:
- `GET /profiles/avatar/url` - для получения presigned URL
- `GET /profiles/avatar` - для прямого скачивания файла

## Обработка ошибок

### 400 Bad Request
- Не предоставлен файл
- Неподдерживаемый тип файла
- Превышен размер файла (10MB)

### 401 Unauthorized
- Отсутствует или недействительный JWT токен

### 404 Not Found
- Пользователь не найден
- Аватарка не найдена
- Файл не найден в storage

### 500 Internal Server Error
- Ошибка загрузки в storage
- Ошибка обновления профиля

## Примеры использования

### Полный цикл работы с аватаркой

1. **Загрузка аватарки:**
```bash
curl -X POST http://localhost:3000/profiles/avatar/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@my_avatar.jpg"
```

2. **Получение URL аватарки:**
```bash
curl -X GET http://localhost:3000/profiles/avatar/url \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Получение профиля с информацией об аватарке:**
```bash
curl -X GET http://localhost:3000/profiles/hr \
  -H "Authorization: Bearer YOUR_TOKEN"
```

4. **Удаление аватарки:**
```bash
curl -X POST http://localhost:3000/profiles/avatar/delete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Безопасность

- Все эндпоинты требуют авторизации
- Файлы сохраняются в защищенном MinIO storage
- Presigned URLs имеют ограниченное время жизни (7 дней)
- Поддерживаются только изображения
- Ограничение размера файла (10MB)
