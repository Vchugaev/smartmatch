# AI Agent - Исправленная версия

## 🔧 Исправления

### Проблемы, которые были исправлены:

1. **Неправильная модель по умолчанию** - изменено с `llama2` на `gemma3:latest`
2. **Неправильный API эндпоинт** - изменено с `/api/chat` на `/api/generate`
3. **Обработка сообщений** - добавлено преобразование сообщений в промпт

## 🚀 Быстрый тест

### 1. Тест Ollama напрямую
```bash
node test-ollama-direct.js "Привет! Как дела?"
```

### 2. Запуск приложения
```bash
npm run start:dev
```

### 3. Тест через API
```bash
node test-chat-example.js "Привет! Расскажи о себе"
```

## 📡 API эндпоинты

### POST /ai-test/chat
**Отправляемые данные:**
```json
{
  "message": "Ваше сообщение",
  "model": "gemma3:latest"
}
```

**Получаемые данные:**
```json
{
  "success": true,
  "data": {
    "response": "Ответ AI агента"
  },
  "processingTime": 1250
}
```

## 🧪 Тестирование

### Прямой тест Ollama
```bash
# Тест с несколькими сообщениями
node test-ollama-direct.js

# Тест с вашим сообщением
node test-ollama-direct.js "Какие навыки нужны для frontend разработчика?"
```

### Тест через API
```bash
# Запустите приложение в одном терминале
npm run start:dev

# В другом терминале протестируйте
node test-chat-example.js "Привет! Как дела?"
```

## 🔧 Настройка

### Модель по умолчанию
В файле `src/modules/ai/ollama.service.ts`:
```typescript
async chat(messages: Array<{ role: string; content: string }>, model: string = 'gemma3:latest')
```

### API эндпоинт
Используется `/api/generate` вместо `/api/chat` для совместимости с вашей версией Ollama.

## 📝 Примеры использования

### JavaScript
```javascript
const response = await fetch('http://localhost:3000/ai-test/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Привет! Как дела?'
  })
});

const result = await response.json();
console.log('Ответ AI:', result.data.response);
```

### cURL
```bash
curl -X POST http://localhost:3000/ai-test/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Привет! Расскажи о себе."}'
```

## 🎯 Функциональность

AI агент теперь поддерживает:

- ✅ **Чат с AI** - общение с нейросетью
- ✅ **Анализ резюме** - извлечение данных из резюме
- ✅ **Генерация описаний вакансий** - создание профессиональных описаний
- ✅ **Анализ соответствия** - оценка match между кандидатом и вакансией
- ✅ **Персональные рекомендации** - советы для развития карьеры
- ✅ **Анализ навыков** - оценка и рекомендации по навыкам
- ✅ **Генерация сопроводительных писем** - персональные письма

## 🐛 Устранение проблем

### Ollama недоступен
```bash
# Проверьте статус
curl http://109.73.193.10:11434/api/tags
```

### Модель не найдена
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

## 🎉 Готово к использованию!

AI агент исправлен и готов к работе с вашей моделью `gemma3:latest`!
