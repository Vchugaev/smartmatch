# AI Chat API - Документация

## POST /ai-test/chat

### 📤 Отправляемые данные

```json
{
  "message": "Привет! Как дела?",
  "model": "gemma3:latest"
}
```

#### Поля запроса:

| Поле | Тип | Обязательное | Описание | По умолчанию |
|------|-----|-------------|----------|--------------|
| `message` | string | ✅ Да | Сообщение для AI агента | - |
| `model` | string | ❌ Нет | Модель для использования | `gemma3:latest` |

#### Примеры запросов:

**Простой чат:**
```json
{
  "message": "Привет! Расскажи о себе."
}
```

**Чат с указанием модели:**
```json
{
  "message": "Объясни, что такое машинное обучение",
  "model": "gemma3:latest"
}
```

**Вопрос о работе:**
```json
{
  "message": "Какие навыки нужны для работы frontend разработчиком?"
}
```

### 📥 Получаемые данные

#### Успешный ответ (200 OK):
```json
{
  "success": true,
  "data": {
    "response": "Привет! Я AI агент для системы SmartMatch. Я помогаю с анализом резюме, генерацией описаний вакансий и другими задачами в сфере HR. Чем могу помочь?"
  },
  "processingTime": 1250
}
```

#### Ошибка (500 Internal Server Error):
```json
{
  "success": false,
  "error": "Failed to process chat message",
  "processingTime": 500
}
```

#### Поля ответа:

| Поле | Тип | Описание |
|------|-----|----------|
| `success` | boolean | Успешность операции |
| `data.response` | string | Ответ AI агента |
| `processingTime` | number | Время обработки в миллисекундах |
| `error` | string | Сообщение об ошибке (если есть) |

## 🔧 Примеры использования

### JavaScript (fetch)
```javascript
const response = await fetch('http://localhost:3000/ai-test/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Привет! Как дела?'
  })
});

const result = await response.json();
console.log('Ответ AI:', result.data.response);
```

### JavaScript (axios)
```javascript
const axios = require('axios');

const response = await axios.post('http://localhost:3000/ai-test/chat', {
  message: 'Объясни, что такое React',
  model: 'gemma3:latest'
});

console.log('Ответ:', response.data.data.response);
console.log('Время обработки:', response.data.processingTime);
```

### cURL
```bash
curl -X POST http://localhost:3000/ai-test/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Привет! Расскажи о своих возможностях.",
    "model": "gemma3:latest"
  }'
```

### Python (requests)
```python
import requests

response = requests.post('http://localhost:3000/ai-test/chat', json={
    'message': 'Какие навыки нужны для Python разработчика?',
    'model': 'gemma3:latest'
})

result = response.json()
print(f"Ответ AI: {result['data']['response']}")
print(f"Время обработки: {result['processingTime']}ms")
```

## 🎯 Примеры диалогов

### 1. Знакомство с AI
**Запрос:**
```json
{
  "message": "Привет! Кто ты и что умеешь?"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "response": "Привет! Я AI агент для системы SmartMatch. Я помогаю с:\n- Анализом резюме кандидатов\n- Генерацией описаний вакансий\n- Оценкой соответствия кандидата и вакансии\n- Созданием персональных рекомендаций\n- Анализом навыков\n- Генерацией сопроводительных писем\n\nЧем могу помочь?"
  },
  "processingTime": 2100
}
```

### 2. Вопрос о карьере
**Запрос:**
```json
{
  "message": "Какие навыки нужны для работы frontend разработчиком в 2024 году?"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "response": "Для frontend разработчика в 2024 году важны:\n\n**Основные технологии:**\n- JavaScript (ES6+)\n- React, Vue.js или Angular\n- TypeScript\n- HTML5/CSS3\n\n**Дополнительные навыки:**\n- Webpack, Vite\n- Git\n- Responsive design\n- API интеграция\n- Тестирование (Jest, Cypress)\n\n**Современные тренды:**\n- Next.js, Nuxt.js\n- Tailwind CSS\n- GraphQL\n- PWA разработка"
  },
  "processingTime": 1800
}
```

### 3. Помощь с резюме
**Запрос:**
```json
{
  "message": "Помоги написать резюме для junior разработчика"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "response": "Вот структура резюме для junior разработчика:\n\n**1. Контактная информация**\n- Имя, телефон, email\n- LinkedIn профиль\n- GitHub (если есть)\n\n**2. Краткое резюме**\n- 2-3 предложения о ваших целях\n- Ключевые навыки\n\n**3. Технические навыки**\n- Языки программирования\n- Фреймворки и библиотеки\n- Инструменты разработки\n\n**4. Проекты**\n- Личные проекты\n- Учебные проекты\n- Ссылки на GitHub\n\n**5. Образование**\n- Университет/курсы\n- Сертификаты\n\n**6. Опыт (если есть)**\n- Стажировки\n- Фриланс\n- Волонтерские проекты"
  },
  "processingTime": 2200
}
```

## ⚠️ Обработка ошибок

### Типичные ошибки:

1. **Ollama недоступен:**
```json
{
  "success": false,
  "error": "Ollama server is not available",
  "processingTime": 100
}
```

2. **Таймаут запроса:**
```json
{
  "success": false,
  "error": "Request timeout",
  "processingTime": 30000
}
```

3. **Неверный формат запроса:**
```json
{
  "success": false,
  "error": "Validation failed",
  "processingTime": 50
}
```

### Обработка в коде:

```javascript
try {
  const response = await fetch('/ai-test/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Привет!' })
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('Ответ AI:', result.data.response);
  } else {
    console.error('Ошибка:', result.error);
  }
} catch (error) {
  console.error('Ошибка сети:', error.message);
}
```

## 🔧 Настройка

### Доступные модели:
- `gemma3:latest` (по умолчанию)
- `llama2:latest`
- `mistral:latest`

### Таймауты:
- По умолчанию: 30 секунд
- Можно настроить в `ollama.service.ts`

### Лимиты:
- Максимальная длина сообщения: 4000 символов
- Рекомендуемая длина: до 1000 символов
