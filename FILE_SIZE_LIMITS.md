# Настройки лимитов размера файлов

## Изменения в конфигурации

### 1. **Multer конфигурация** (`src/config/multer.config.ts`)
- **Было:** 10MB
- **Стало:** 50MB

```typescript
limits: {
  fileSize: 50 * 1024 * 1024, // 50MB
  files: 1, // Только один файл за раз
}
```

### 2. **Storage контроллер** (`src/modules/storage/storage.controller.ts`)
- **Было:** 10MB
- **Стало:** 50MB

```typescript
const maxFileSize = 50 * 1024 * 1024; // 50MB
```

### 3. **Main.ts** (`src/main.ts`)
- Добавлен middleware для увеличения timeout для загрузки файлов
- Применяется к эндпоинтам:
  - `/profiles/avatar/upload`
  - `/storage/upload`

```typescript
app.use((req, res, next) => {
  if (req.url.includes('/profiles/avatar/upload') || req.url.includes('/storage/upload')) {
    req.setTimeout(300000); // 5 минут
    res.setTimeout(300000); // 5 минут
  }
  next();
});
```

## Результат

Теперь можно загружать файлы размером до **50MB** без ошибки "request entity too large".

### Поддерживаемые эндпоинты:
- `POST /profiles/avatar/upload` - загрузка аватарки профиля
- `POST /storage/upload` - загрузка файлов в storage

### Ограничения:
- **Максимальный размер файла:** 50MB
- **Тип файлов:** только изображения (`image/*`)
- **Количество файлов:** 1 файл за раз
- **Timeout:** 5 минут для загрузки

## Тестирование

```bash
# Тест загрузки большого файла
curl -X POST http://localhost:3000/profiles/avatar/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@large_image.jpg" # файл до 50MB
```

Теперь загрузка больших изображений должна работать без ошибок! 🎉
