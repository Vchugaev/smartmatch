# 🚀 Упрощенный API откликов на вакансии

## Обзор изменений

Система откликов была упрощена для улучшения пользовательского опыта:

### ❌ Было (сложно):
- Пользователь должен был заполнять сопроводительное письмо при каждом отклике
- Нужно было загружать резюме для каждой вакансии отдельно
- Много полей для заполнения

### ✅ Стало (просто):
- Пользователь загружает резюме **один раз** в профиль
- Кнопка отклика требует только `jobId`
- Резюме автоматически прикрепляется к отклику
- Никаких дополнительных форм

## 🔧 Изменения в API

### 1. Упрощенный DTO для создания отклика

**Было:**
```typescript
export class CreateApplicationDto {
  @IsString()
  jobId: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  coverLetter?: string;

  @IsOptional()
  @IsString()
  resumeUrl?: string;
}
```

**Стало:**
```typescript
export class CreateApplicationDto {
  @IsString()
  jobId: string;
}
```

### 2. Автоматическое использование резюме из профиля

Сервис теперь автоматически:
- Получает профиль кандидата по `userId`
- Проверяет наличие резюме в профиле
- Автоматически прикрепляет резюме к отклику

### 3. Улучшенная валидация

- Проверка существования профиля кандидата
- Проверка наличия резюме в профиле
- Автоматическое создание профиля при необходимости

## 📋 API Endpoints

### Создание отклика

```http
POST /applications
Authorization: Bearer <token>
Content-Type: application/json

{
  "jobId": "job_id_here"
}
```

**Ответ при успехе:**
```json
{
  "id": "application_id",
  "jobId": "job_id",
  "candidateId": "candidate_profile_id",
  "hrId": "hr_id",
  "status": "PENDING",
  "resumeUrl": "https://storage.example.com/resume.pdf",
  "appliedAt": "2024-01-15T00:00:00.000Z",
  "job": {
    "id": "job_id",
    "title": "Frontend Developer",
    "hr": {
      "company": "ООО Технологии"
    }
  },
  "candidate": {
    "firstName": "Анна",
    "lastName": "Смирнова"
  }
}
```

**Возможные ошибки:**
- `404` - Вакансия не найдена
- `404` - Профиль кандидата не найден
- `409` - Вы уже откликались на эту вакансию
- `409` - Для отклика необходимо загрузить резюме в профиль

### Получение моих откликов

```http
GET /applications/my
Authorization: Bearer <token>
```

**Ответ:**
```json
[
  {
    "id": "application_id",
    "status": "PENDING",
    "appliedAt": "2024-01-15T00:00:00.000Z",
    "job": {
      "id": "job_id",
      "title": "Frontend Developer",
      "location": "Москва",
      "type": "FULL_TIME",
      "status": "ACTIVE",
      "hr": {
        "company": "ООО Технологии"
      }
    }
  }
]
```

## 🎯 Примеры использования

### JavaScript (Frontend)

```javascript
// 1. Загрузка резюме в профиль (делается один раз)
async function uploadResume(file, token) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/profiles/candidate/resume', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  
  return response.json();
}

// 2. Отклик на вакансию (простая кнопка)
async function applyToJob(jobId, token) {
  const response = await fetch('/applications', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ jobId })
  });
  
  return response.json();
}

// 3. Получение моих откликов
async function getMyApplications(token) {
  const response = await fetch('/applications/my', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return response.json();
}
```

### React компонент

```jsx
import React, { useState } from 'react';

function JobApplication({ jobId }) {
  const [isApplied, setIsApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    try {
      await applyToJob(jobId, token);
      setIsApplied(true);
      alert('Отклик успешно отправлен!');
    } catch (error) {
      alert(`Ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleApply}
        disabled={loading || isApplied}
        className="apply-button"
      >
        {loading ? 'Отправка...' : isApplied ? 'Отклик отправлен' : 'Откликнуться'}
      </button>
    </div>
  );
}
```

### HTML форма

```html
<!DOCTYPE html>
<html>
<head>
    <title>Отклик на вакансию</title>
</head>
<body>
    <h1>Отклик на вакансию</h1>
    
    <!-- Загрузка резюме (один раз) -->
    <div>
        <h3>1. Загрузите резюме в профиль</h3>
        <input type="file" id="resumeFile" accept=".pdf,.doc,.docx">
        <button onclick="uploadResume()">Загрузить резюме</button>
    </div>
    
    <!-- Отклик на вакансию -->
    <div>
        <h3>2. Откликнуться на вакансию</h3>
        <input type="text" id="jobId" placeholder="ID вакансии">
        <button onclick="applyToJob()">Откликнуться</button>
    </div>
    
    <script>
        async function applyToJob() {
            const jobId = document.getElementById('jobId').value;
            const response = await fetch('/applications', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ jobId })
            });
            
            if (response.ok) {
                alert('Отклик успешно отправлен!');
            } else {
                const error = await response.json();
                alert(`Ошибка: ${error.message}`);
            }
        }
    </script>
</body>
</html>
```

## 🔄 Миграция существующих данных

Существующие отклики с `coverLetter` и `resumeUrl` остаются без изменений. Новые отклики будут использовать только резюме из профиля.

## 🎉 Преимущества нового подхода

1. **Простота использования** - одна кнопка для отклика
2. **Консистентность** - одно резюме для всех откликов
3. **Меньше ошибок** - автоматическое прикрепление резюме
4. **Лучший UX** - пользователь заполняет профиль один раз
5. **Упрощенная поддержка** - меньше полей для валидации

## 🚨 Важные замечания

1. **Резюме обязательно** - без резюме в профиле отклик невозможен
2. **Профиль создается автоматически** - при первом отклике
3. **Обратная совместимость** - старые отклики работают как прежде
4. **Валидация** - система проверяет все необходимые условия

## 📞 Поддержка

При возникновении проблем проверьте:
- Загружено ли резюме в профиль
- Существует ли вакансия
- Не откликались ли уже на эту вакансию
- Корректность токена авторизации
