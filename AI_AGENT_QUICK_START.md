# AI Agent - Быстрый старт

## 🚀 Запуск AI агента

### 1. Проверка Ollama
```bash
# Проверяем, что Ollama работает
curl http://109.73.193.10:11434/api/tags
```

### 2. Запуск приложения
```bash
# Запускаем NestJS приложение
npm run start:dev
```

### 3. Тестирование AI агента
```bash
# Простой тест
node test-ai-simple.js

# Полный тест с запуском
node start-and-test.js
```

## 🤖 Доступные функции

### Без авторизации (для тестирования)
- `GET /ai-test/health` - Проверка здоровья
- `POST /ai-test/chat` - Чат с AI
- `POST /ai-test/analyze-resume` - Анализ резюме
- `GET /ai-test/models` - Список моделей

### С авторизацией (продакшн)
- `GET /ai/health` - Проверка здоровья
- `POST /ai/chat` - Чат с AI
- `POST /ai/analyze-resume` - Анализ резюме
- `POST /ai/generate-job-description` - Генерация описания вакансии
- `POST /ai/analyze-job-match` - Анализ соответствия
- `POST /ai/generate-recommendations` - Рекомендации
- `POST /ai/analyze-skills` - Анализ навыков
- `POST /ai/generate-cover-letter` - Сопроводительное письмо

## 📝 Примеры использования

### 1. Чат с AI
```javascript
const response = await fetch('http://localhost:3000/ai-test/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Привет! Расскажи о себе.'
  })
});

const result = await response.json();
console.log('Ответ AI:', result.data.response);
```

### 2. Анализ резюме
```javascript
const response = await fetch('http://localhost:3000/ai-test/analyze-resume', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    resumeText: `
Иван Петров
Email: ivan@email.com
Навыки: JavaScript, React, Node.js
Опыт: 5 лет разработки
    `
  })
});

const result = await response.json();
console.log('Анализ:', result.data);
```

### 3. Проверка здоровья
```javascript
const response = await fetch('http://localhost:3000/ai-test/health');
const health = await response.json();
console.log('Статус:', health.healthy);
console.log('Модели:', health.models);
```

## 🔧 Настройка

### Переменные окружения
```env
OLLAMA_BASE_URL=http://109.73.193.10:11434
```

### Модель по умолчанию
AI агент настроен на работу с `gemma3:latest`. Если нужно изменить:

```typescript
// В ollama.service.ts
async analyzeResume(resumeText: string, model: string = 'gemma3:latest')
```

## 🐛 Устранение проблем

### Ollama недоступен
```bash
# Проверьте статус Ollama
curl http://109.73.193.10:11434/api/tags
```

### Нет моделей
```bash
# Установите модель
ollama pull gemma3
```

### Приложение не запускается
```bash
# Проверьте зависимости
npm install

# Очистите кэш
npm run build
```

### Ошибки авторизации
Используйте тестовые эндпоинты `/ai-test/*` для проверки без авторизации.

## 📊 Мониторинг

### Логи
AI сервис логирует:
- Время обработки запросов
- Ошибки подключения
- Результаты анализа

### Метрики
```javascript
// Получение статистики
const health = await fetch('/ai-test/health');
const stats = await health.json();
console.log('Время отклика:', stats.processingTime);
```

## 🎯 Следующие шаги

1. **Интеграция с существующими модулями**
   - Подключите AI к модулю резюме
   - Добавьте автоматический анализ заявок
   - Интегрируйте с системой уведомлений

2. **Расширение функциональности**
   - Добавьте новые типы анализа
   - Создайте персональные рекомендации
   - Реализуйте автоматическую генерацию контента

3. **Оптимизация**
   - Кэширование результатов
   - Батчинг запросов
   - Мониторинг производительности

## 🆘 Поддержка

При возникновении проблем:
1. Проверьте логи приложения
2. Убедитесь в доступности Ollama
3. Запустите тестовые скрипты
4. Проверьте переменные окружения
