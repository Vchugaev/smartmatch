# 🔧 Устранение проблем HR AI Analysis

## ❌ Ошибка: "HR профиль не найден"

### Проблема
```
{"statusCode":403,"message":"HR профиль не найден"}
```

### Причина
Пользователь имеет роль `HR`, но у него нет HR профиля в базе данных.

### Решение

#### 1. Создать HR профиль
```bash
# Создать HR профиль через API
curl -X POST http://localhost:3000/profiles/hr \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "ООО Технологии",
    "firstName": "Иван",
    "lastName": "Петров",
    "phone": "+7-999-123-45-67"
  }'
```

#### 2. Проверить HR профиль
```bash
# Проверить, что HR профиль создан
curl -X GET http://localhost:3000/hr/debug \
  -H "Authorization: Bearer <your_token>"
```

#### 3. Теперь можно использовать AI анализ
```bash
# Анализ кандидатов
curl -X POST http://localhost:3000/hr-ai/analyze-job-candidates \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"jobId": "your_job_id"}'
```

## 🔍 Диагностика

### Проверка тестового endpoint
```bash
# Тест без авторизации
curl -X GET http://localhost:3000/hr-ai/test
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "message": "HR AI Analysis контроллер работает!",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Проверка здоровья AI
```bash
# Проверка AI сервиса
curl -X GET http://localhost:3000/hr-ai/health \
  -H "Authorization: Bearer <your_token>"
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "data": {
    "healthy": true,
    "message": "AI сервис доступен для анализа кандидатов"
  }
}
```

## 📋 Пошаговая инструкция

### Шаг 1: Проверка авторизации
```bash
# Проверить, что токен валидный
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <your_token>"
```

### Шаг 2: Создание HR профиля
```bash
# Создать HR профиль
curl -X POST http://localhost:3000/profiles/hr \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Ваша компания",
    "firstName": "Ваше имя",
    "lastName": "Ваша фамилия",
    "phone": "Ваш телефон"
  }'
```

### Шаг 3: Проверка HR профиля
```bash
# Диагностика HR системы
curl -X GET http://localhost:3000/hr/debug \
  -H "Authorization: Bearer <your_token>"
```

### Шаг 4: Тест AI анализа
```bash
# Анализ кандидатов (замените jobId на реальный)
curl -X POST http://localhost:3000/hr-ai/analyze-job-candidates \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"jobId": "cmgx62l920001ukfw2cq9mpxx"}'
```

## 🚨 Другие возможные ошибки

### 404 - Маршрут не найден
```
{"statusCode":404,"message":"Cannot POST /hr-ai/analyze-job-candidates"}
```

**Решение:** Перезапустить сервер
```bash
npm run start:dev
```

### 500 - Ошибка AI сервиса
```
{"statusCode":500,"message":"Ошибка AI анализа: ..."}
```

**Решение:** Проверить доступность Ollama
```bash
curl http://109.73.193.10:11434/api/tags
```

### 400 - Неверные параметры
```
{"statusCode":400,"message":"jobId is required"}
```

**Решение:** Убедиться, что передаете jobId в запросе
```json
{
  "jobId": "valid_job_id_here"
}
```

## 📞 Поддержка

Если проблемы продолжаются:

1. Проверьте логи сервера
2. Убедитесь, что база данных подключена
3. Проверьте доступность Ollama сервиса
4. Проверьте права пользователя

---

**Примечание:** Все команды предполагают, что сервер запущен на `http://localhost:3000`
