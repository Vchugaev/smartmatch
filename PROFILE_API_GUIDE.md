# Руководство по получению данных профиля

## Обзор API профилей

В системе SmartMatch существует 3 типа профилей:
- **HR Profile** - для HR-менеджеров
- **Candidate Profile** - для соискателей
- **University Profile** - для университетов

## Аутентификация

Все эндпоинты профилей требуют аутентификации через JWT токен.

### Получение токена
```bash
# Регистрация
POST /auth/register
{
  "email": "user@example.com",
  "password": "Password123",
  "role": "CANDIDATE"
}

# Вход
POST /auth/login
{
  "email": "user@example.com", 
  "password": "Password123"
}
```

### Использование токена
```bash
# В заголовке Authorization
Authorization: Bearer <your-jwt-token>

# Или через HTTP-only куки (автоматически)
# Токен будет в куке access_token
```

## API Эндпоинты

### 1. HR Профиль

#### Получение HR профиля
```bash
GET /profiles/hr
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "id": "hr_profile_id",
  "userId": "user_id",
  "firstName": "Иван",
  "lastName": "Петров",
  "company": "ООО Технологии",
  "position": "HR Manager",
  "phone": "+7-999-123-45-67",
  "avatarId": "avatar_file_id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user_id",
    "email": "hr@company.com",
    "role": "HR"
  },
  "jobs": [
    {
      "id": "job_id",
      "title": "Frontend Developer",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Создание HR профиля
```bash
POST /profiles/hr
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Иван",
  "lastName": "Петров",
  "company": "ООО Технологии",
  "position": "HR Manager",
  "phone": "+7-999-123-45-67",
  "avatarId": "uploaded_avatar_id"
}
```

#### Обновление HR профиля
```bash
PATCH /profiles/hr
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Иван",
  "company": "Новая компания",
  "phone": "+7-999-987-65-43"
}
```

### 2. Candidate Профиль

#### Получение Candidate профиля
```bash
GET /profiles/candidate
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "id": "candidate_profile_id",
  "userId": "user_id",
  "firstName": "Анна",
  "lastName": "Смирнова",
  "phone": "+7-999-123-45-67",
  "dateOfBirth": "1995-05-15T00:00:00.000Z",
  "location": "Москва",
  "bio": "Frontend разработчик с 3 годами опыта",
  "avatarId": "avatar_file_id",
  "resumeId": "resume_file_id",
  "linkedinUrl": "https://linkedin.com/in/anna-smirnova",
  "githubUrl": "https://github.com/anna-smirnova",
  "portfolioUrl": "https://anna-smirnova.dev",
  "isAvailable": true,
  "expectedSalary": 150000,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user_id",
    "email": "anna@example.com",
    "role": "CANDIDATE"
  },
  "skills": [
    {
      "id": "skill_relation_id",
      "level": 4,
      "skill": {
        "id": "skill_id",
        "name": "JavaScript",
        "category": "Programming",
        "description": "JavaScript programming language"
      }
    }
  ],
  "experiences": [
    {
      "id": "experience_id",
      "company": "ООО Веб-Студия",
      "position": "Frontend Developer",
      "startDate": "2021-06-01T00:00:00.000Z",
      "endDate": "2024-01-01T00:00:00.000Z",
      "description": "Разработка пользовательских интерфейсов",
      "isCurrent": false
    }
  ],
  "educations": [
    {
      "id": "education_id",
      "degree": "Бакалавр",
      "field": "Информатика",
      "startDate": "2017-09-01T00:00:00.000Z",
      "endDate": "2021-06-30T00:00:00.000Z",
      "gpa": 4.5,
      "description": "Специализация по веб-разработке"
    }
  ],
  "applications": [
    {
      "id": "application_id",
      "status": "PENDING",
      "appliedAt": "2024-01-15T00:00:00.000Z",
      "job": {
        "id": "job_id",
        "title": "Senior Frontend Developer",
        "status": "ACTIVE",
        "hr": {
          "company": "ООО Технологии"
        }
      }
    }
  ]
}
```

#### Создание Candidate профиля
```bash
POST /profiles/candidate
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Анна",
  "lastName": "Смирнова",
  "phone": "+7-999-123-45-67",
  "dateOfBirth": "1995-05-15",
  "location": "Москва",
  "bio": "Frontend разработчик с 3 годами опыта",
  "linkedinUrl": "https://linkedin.com/in/anna-smirnova",
  "githubUrl": "https://github.com/anna-smirnova"
}
```

#### Обновление Candidate профиля
```bash
PATCH /profiles/candidate
Authorization: Bearer <token>
Content-Type: application/json

{
  "bio": "Обновленное описание",
  "location": "Санкт-Петербург",
  "linkedinUrl": "https://linkedin.com/in/new-profile"
}
```

### 3. University Профиль

#### Получение University профиля
```bash
GET /profiles/university
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "id": "university_profile_id",
  "userId": "user_id",
  "name": "Московский Государственный Университет",
  "address": "Москва, Ленинские горы, 1",
  "phone": "+7-495-939-10-00",
  "website": "https://msu.ru",
  "logoId": "logo_file_id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user_id",
    "email": "admin@msu.ru",
    "role": "UNIVERSITY"
  },
  "students": [
    {
      "id": "student_id",
      "firstName": "Петр",
      "lastName": "Иванов",
      "email": "petr.ivanov@student.msu.ru",
      "major": "Информатика",
      "skills": [
        {
          "id": "student_skill_id",
          "level": 3,
          "skill": {
            "id": "skill_id",
            "name": "Python",
            "category": "Programming"
          }
        }
      ]
    }
  ],
  "educations": [
    {
      "id": "education_id",
      "degree": "Бакалавр",
      "field": "Информатика",
      "startDate": "2020-09-01T00:00:00.000Z",
      "endDate": "2024-06-30T00:00:00.000Z"
    }
  ]
}
```

#### Создание University профиля
```bash
POST /profiles/university
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Московский Государственный Университет",
  "address": "Москва, Ленинские горы, 1",
  "phone": "+7-495-939-10-00",
  "website": "https://msu.ru",
  "logoId": "uploaded_logo_id"
}
```

#### Обновление University профиля
```bash
PATCH /profiles/university
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "МГУ им. М.В. Ломоносова",
  "website": "https://www.msu.ru"
}
```

### 4. Универсальный эндпоинт

#### Обновление любого профиля
```bash
PATCH /profiles
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Новое имя",
  "lastName": "Новая фамилия",
  "phone": "+7-999-123-45-67"
}
```

## Примеры использования

### JavaScript/TypeScript

```javascript
// Получение токена
async function login(email, password) {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Для куки
    body: JSON.stringify({ email, password })
  });
  
  return response.json();
}

// Получение профиля кандидата
async function getCandidateProfile() {
  const response = await fetch('/profiles/candidate', {
    method: 'GET',
    credentials: 'include', // Для куки
    headers: {
      'Authorization': `Bearer ${token}` // Если используете токен в заголовке
    }
  });
  
  return response.json();
}

// Обновление профиля
async function updateProfile(profileData) {
  const response = await fetch('/profiles', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include',
    body: JSON.stringify(profileData)
  });
  
  return response.json();
}
```

### cURL

```bash
# Получение токена
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "Password123"}' \
  -c cookies.txt

# Получение профиля (с куками)
curl -X GET http://localhost:3000/profiles/candidate \
  -b cookies.txt

# Получение профиля (с токеном)
curl -X GET http://localhost:3000/profiles/candidate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Обновление профиля
curl -X PATCH http://localhost:3000/profiles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"firstName": "Новое имя", "bio": "Новое описание"}'
```

## Обработка ошибок

### Возможные ошибки:

1. **401 Unauthorized** - Неверный или отсутствующий токен
2. **403 Forbidden** - Недостаточно прав (неправильная роль)
3. **404 Not Found** - Профиль не найден
4. **409 Conflict** - Профиль уже существует
5. **400 Bad Request** - Ошибки валидации

### Пример обработки ошибок:

```javascript
async function getProfile() {
  try {
    const response = await fetch('/profiles/candidate', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const profile = await response.json();
    return profile;
  } catch (error) {
    console.error('Ошибка получения профиля:', error.message);
  }
}
```

## Безопасность

1. **JWT токены** имеют срок действия 1 час
2. **HTTP-only куки** защищают от XSS атак
3. **CORS** настроен для cross-origin запросов
4. **Валидация** всех входящих данных
5. **Роли пользователей** проверяются для доступа к профилям

## Дополнительные возможности

### Загрузка файлов (аватары, резюме, логотипы)

```javascript
// Загрузка аватара
async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/storage/upload', {
    method: 'POST',
    credentials: 'include',
    body: formData
  });
  
  const result = await response.json();
  return result.fileId; // Используйте этот ID в avatarId
}
```

### Получение медиа файлов

```javascript
// Получение URL файла
async function getFileUrl(fileId) {
  const response = await fetch(`/storage/file/${fileId}`, {
    credentials: 'include'
  });
  
  return response.url; // Прямой URL к файлу
}
```
