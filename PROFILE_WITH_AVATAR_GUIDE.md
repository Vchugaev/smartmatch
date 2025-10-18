# Профили с аватарками - Руководство по API

## Обновленные эндпоинты профилей

Теперь все эндпоинты получения профилей автоматически включают URL аватарки в ответ.

### 1. HR Профиль
**Эндпоинт:** `GET /profiles/hr`

**Ответ:**
```json
{
  "id": "clx1234567890",
  "userId": "clx0987654321",
  "firstName": "Иван",
  "lastName": "Петров",
  "company": "ООО Технологии",
  "position": "HR Менеджер",
  "phone": "+7 (999) 123-45-67",
  "avatarId": "avatars/avatar_123456.jpg",
  "avatarUrl": "https://storage.vchugaev.ru/smartmatch/avatars/avatar_123456.jpg?X-Amz-Algorithm=...",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "user": {
    "id": "clx0987654321",
    "email": "ivan.petrov@company.com",
    "role": "HR"
  },
  "jobs": [
    {
      "id": "clx1111111111",
      "title": "Frontend Developer",
      "status": "ACTIVE",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 2. Профиль Кандидата
**Эндпоинт:** `GET /profiles/candidate`

**Ответ:**
```json
{
  "id": "clx1234567890",
  "userId": "clx0987654321",
  "firstName": "Анна",
  "lastName": "Смирнова",
  "phone": "+7 (999) 987-65-43",
  "dateOfBirth": "1995-05-15T00:00:00Z",
  "location": "Москва",
  "bio": "Опытный frontend разработчик с 5+ летним стажем",
  "avatarId": "avatars/avatar_789012.jpg",
  "avatarUrl": "https://storage.vchugaev.ru/smartmatch/avatars/avatar_789012.jpg?X-Amz-Algorithm=...",
  "resumeId": "resumes/resume_789012.pdf",
  "linkedinUrl": "https://linkedin.com/in/anna-smirnova",
  "githubUrl": "https://github.com/anna-smirnova",
  "portfolioUrl": "https://anna-smirnova.dev",
  "isAvailable": true,
  "expectedSalary": 150000,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "user": {
    "id": "clx0987654321",
    "email": "anna.smirnova@email.com",
    "role": "CANDIDATE"
  },
  "skills": [
    {
      "id": "clx2222222222",
      "candidateId": "clx1234567890",
      "skillId": "clx3333333333",
      "level": 4,
      "skill": {
        "id": "clx3333333333",
        "name": "React",
        "category": "Frontend",
        "description": "JavaScript библиотека для создания пользовательских интерфейсов"
      }
    }
  ],
  "experiences": [
    {
      "id": "clx4444444444",
      "candidateId": "clx1234567890",
      "company": "ООО Веб-Студия",
      "position": "Frontend Developer",
      "startDate": "2020-03-01T00:00:00Z",
      "endDate": "2023-12-31T00:00:00Z",
      "description": "Разработка пользовательских интерфейсов на React",
      "isCurrent": false
    }
  ],
  "educations": [
    {
      "id": "clx5555555555",
      "candidateId": "clx1234567890",
      "degree": "Бакалавр",
      "field": "Информатика",
      "startDate": "2013-09-01T00:00:00Z",
      "endDate": "2017-06-30T00:00:00Z",
      "gpa": 4.5,
      "isCurrent": false
    }
  ],
  "applications": [
    {
      "id": "clx6666666666",
      "jobId": "clx1111111111",
      "candidateId": "clx1234567890",
      "hrId": "clx7777777777",
      "status": "PENDING",
      "coverLetter": "Заинтересована в позиции Frontend Developer",
      "appliedAt": "2024-01-15T10:30:00Z",
      "job": {
        "id": "clx1111111111",
        "title": "Frontend Developer",
        "status": "ACTIVE",
        "hr": {
          "company": "ООО Технологии"
        }
      }
    }
  ]
}
```

### 3. Профиль Университета
**Эндпоинт:** `GET /profiles/university`

**Ответ:**
```json
{
  "id": "clx1234567890",
  "userId": "clx0987654321",
  "name": "Московский государственный университет",
  "address": "Москва, Ленинские горы, д. 1",
  "phone": "+7 (495) 939-10-00",
  "website": "https://www.msu.ru",
  "logoId": "logos/logo_123456.jpg",
  "avatarUrl": "https://storage.vchugaev.ru/smartmatch/logos/logo_123456.jpg?X-Amz-Algorithm=...",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "user": {
    "id": "clx0987654321",
    "email": "admin@msu.ru",
    "role": "UNIVERSITY"
  },
  "students": [
    {
      "id": "clx8888888888",
      "universityId": "clx1234567890",
      "firstName": "Петр",
      "lastName": "Иванов",
      "email": "petr.ivanov@student.msu.ru",
      "studentId": "12345678",
      "yearOfStudy": 3,
      "major": "Информатика",
      "gpa": 4.2,
      "phone": "+7 (999) 111-22-33",
      "skills": [
        {
          "id": "clx9999999999",
          "studentId": "clx8888888888",
          "skillId": "clx3333333333",
          "level": 3,
          "skill": {
            "id": "clx3333333333",
            "name": "React",
            "category": "Frontend"
          }
        }
      ]
    }
  ],
  "educations": [
    {
      "id": "clx0000000000",
      "universityId": "clx1234567890",
      "degree": "Бакалавр",
      "field": "Информатика",
      "startDate": "2020-09-01T00:00:00Z",
      "endDate": "2024-06-30T00:00:00Z",
      "gpa": 4.0,
      "isCurrent": true
    }
  ]
}
```

## Особенности

### Поле `avatarUrl`
- **Всегда присутствует** в ответе профилей
- **Может быть `null`** если аватарка не загружена
- **Содержит presigned URL** с временем жизни 7 дней
- **Автоматически обновляется** при каждом запросе профиля

### Для разных типов профилей:
- **HR и Кандидаты:** используется поле `avatarId` → `avatarUrl`
- **Университеты:** используется поле `logoId` → `avatarUrl`

### Безопасность
- **Presigned URLs** имеют ограниченное время жизни
- **Автоматическое обновление** URL при каждом запросе
- **Безопасный доступ** к файлам через MinIO storage

## Примеры использования

### Получение профиля с аватаркой
```bash
# HR профиль
curl -X GET http://localhost:3000/profiles/hr \
  -H "Authorization: Bearer YOUR_TOKEN"

# Профиль кандидата
curl -X GET http://localhost:3000/profiles/candidate \
  -H "Authorization: Bearer YOUR_TOKEN"

# Профиль университета
curl -X GET http://localhost:3000/profiles/university \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Использование avatarUrl в фронтенде
```javascript
// Получение профиля
const response = await fetch('/profiles/hr', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const profile = await response.json();

// Отображение аватарки
if (profile.avatarUrl) {
  const avatarImg = document.createElement('img');
  avatarImg.src = profile.avatarUrl;
  avatarImg.alt = `${profile.firstName} ${profile.lastName}`;
  document.body.appendChild(avatarImg);
} else {
  // Показать дефолтную аватарку
  console.log('Аватарка не загружена');
}
```

## Преимущества

1. **Единый интерфейс** - все профили содержат `avatarUrl`
2. **Автоматическое включение** - не нужно делать дополнительные запросы
3. **Безопасность** - presigned URLs с ограниченным временем жизни
4. **Простота использования** - один запрос для получения профиля с аватаркой
5. **Совместимость** - существующие поля (`avatarId`, `logoId`) остаются
