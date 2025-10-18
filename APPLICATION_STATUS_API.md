# 🎯 API для различения откликнувшихся и не откликнувшихся вакансий

## Обзор

Добавлена функциональность для различения вакансий, на которые пользователь уже откликался, и тех, на которые еще не откликался. Это позволяет фронтенду показывать разные состояния кнопок и интерфейса.

## 🔧 Изменения в API

### 1. Эндпоинт `/jobs` (GET)

**Было:**
```json
{
  "jobs": [
    {
      "id": "job_id",
      "title": "Frontend Developer",
      "description": "...",
      "location": "Москва",
      "type": "FULL_TIME"
    }
  ]
}
```

**Стало:**
```json
{
  "jobs": [
    {
      "id": "job_id",
      "title": "Frontend Developer", 
      "description": "...",
      "location": "Москва",
      "type": "FULL_TIME",
      "hasApplied": true,
      "applicationStatus": "PENDING",
      "appliedAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

### 2. Новые поля в ответе

| Поле | Тип | Описание |
|------|-----|----------|
| `hasApplied` | boolean | Откликался ли пользователь на эту вакансию |
| `applicationStatus` | string \| null | Статус отклика (PENDING, ACCEPTED, REJECTED, etc.) |
| `appliedAt` | string \| null | Дата отклика |

### 3. Статусы откликов

- `PENDING` - Ожидает рассмотрения
- `REVIEWED` - Рассмотрен  
- `ACCEPTED` - Принят
- `REJECTED` - Отклонен
- `INTERVIEW_SCHEDULED` - Интервью назначено
- `HIRED` - Нанят
- `WITHDRAWN` - Отозван

## 🚀 Примеры использования

### JavaScript (Frontend)

```javascript
// Получение вакансий с информацией о статусе откликов
async function getJobsWithApplicationStatus(token) {
  const response = await fetch('/jobs?page=1&limit=10', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.jobs;
}

// Использование
getJobsWithApplicationStatus(userToken)
  .then(jobs => {
    jobs.forEach(job => {
      if (job.hasApplied) {
        console.log(`✅ Откликнулся на "${job.title}" - статус: ${job.applicationStatus}`);
        // Показать кнопку "Отклик отправлен" или "Просмотреть статус"
      } else {
        console.log(`❌ Не откликался на "${job.title}"`);
        // Показать кнопку "Откликнуться"
      }
    });
  });
```

### React компонент

```jsx
function JobCard({ job }) {
  const getButtonText = () => {
    if (!job.hasApplied) {
      return 'Откликнуться';
    }
    
    switch (job.applicationStatus) {
      case 'PENDING':
        return 'Ожидает рассмотрения';
      case 'ACCEPTED':
        return 'Принят';
      case 'REJECTED':
        return 'Отклонен';
      case 'INTERVIEW_SCHEDULED':
        return 'Собеседование назначено';
      default:
        return 'Отклик отправлен';
    }
  };
  
  const getButtonClass = () => {
    if (!job.hasApplied) return 'btn-primary';
    
    switch (job.applicationStatus) {
      case 'PENDING':
        return 'btn-warning';
      case 'ACCEPTED':
        return 'btn-success';
      case 'REJECTED':
        return 'btn-danger';
      default:
        return 'btn-secondary';
    }
  };
  
  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <p>{job.description}</p>
      <button 
        className={`btn ${getButtonClass()}`}
        disabled={job.hasApplied && job.applicationStatus !== 'REJECTED'}
      >
        {getButtonText()}
      </button>
    </div>
  );
}
```

### cURL примеры

```bash
# Без аутентификации (hasApplied всегда false)
curl -X GET http://localhost:3000/jobs?page=1&limit=5

# С аутентификацией (показывает реальный статус откликов)
curl -X GET http://localhost:3000/jobs?page=1&limit=5 \
  -H "Authorization: Bearer <your_jwt_token>"
```

## 🔍 Логика работы

### 1. Без аутентификации
- `hasApplied: false`
- `applicationStatus: null`
- `appliedAt: null`

### 2. С аутентификацией
- Система ищет профиль кандидата по `userId`
- Если профиль найден, проверяет отклики на вакансии
- Если отклик найден, возвращает его статус и дату
- Если отклика нет, возвращает `hasApplied: false`

### 3. Обработка ошибок
- Если нет профиля кандидата → `hasApplied: false`
- Если ошибка базы данных → `hasApplied: false`
- Система не прерывает работу при ошибках

## 📊 Производительность

- **Оптимизированные запросы**: Один запрос для всех откликов пользователя
- **Кэширование**: Используется Map для быстрого поиска
- **Graceful degradation**: При ошибках возвращает вакансии без статуса

## 🎨 UI/UX рекомендации

### Цветовая схема кнопок:
- 🔵 **Синий** - "Откликнуться" (не откликался)
- 🟡 **Желтый** - "Ожидает рассмотрения" (PENDING)
- 🟢 **Зеленый** - "Принят" (ACCEPTED)
- 🔴 **Красный** - "Отклонен" (REJECTED)
- 🟣 **Фиолетовый** - "Собеседование назначено" (INTERVIEW_SCHEDULED)

### Состояния интерфейса:
- **Не откликался**: Показать кнопку "Откликнуться"
- **Откликнулся**: Показать статус и дату отклика
- **Отклонен**: Возможно показать кнопку "Откликнуться снова"

## 🔧 Технические детали

### Изменения в коде:
1. **JobsController**: Добавлен параметр `userId` в `findAll()`
2. **JobsService**: Добавлен метод `addApplicationStatusToJobs()`
3. **API Response**: Добавлены поля `hasApplied`, `applicationStatus`, `appliedAt`

### Безопасность:
- JWT токен не обязателен (работает без аутентификации)
- При ошибках возвращает безопасные значения по умолчанию
- Не раскрывает информацию о других пользователях
