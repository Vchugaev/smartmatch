# REST API Эндпоинты для платформы SmartMatch

## Аутентификация

### POST /auth/register
Регистрация нового пользователя
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "HR" | "CANDIDATE" | "UNIVERSITY"
}
```

### POST /auth/login
Вход в систему
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

## Вакансии

### GET /jobs
Получить список вакансий с фильтрацией
- Query параметры: search, type, experienceLevel, location, remote, page, limit

### GET /jobs/my
Получить вакансии текущего HR (требует аутентификации)

### GET /jobs/:id
Получить вакансию по ID

### POST /jobs
Создать новую вакансию (требует аутентификации HR)
```json
{
  "title": "Frontend Developer",
  "description": "Описание вакансии",
  "requirements": "Требования",
  "responsibilities": "Обязанности",
  "benefits": "Преимущества",
  "salaryMin": 50000,
  "salaryMax": 80000,
  "currency": "RUB",
  "location": "Москва",
  "type": "FULL_TIME",
  "experienceLevel": "JUNIOR",
  "remote": false,
  "deadline": "2024-12-31",
  "skillIds": ["skill1", "skill2"]
}
```

### PATCH /jobs/:id
Обновить вакансию (требует аутентификации HR)

### DELETE /jobs/:id
Удалить вакансию (требует аутентификации HR)

## Отклики на вакансии

### GET /applications
Получить список откликов с фильтрацией
- Query параметры: status, jobId, candidateId

### GET /applications/my
Получить отклики текущего пользователя (HR или кандидат)

### GET /applications/:id
Получить отклик по ID

### POST /applications
Создать новый отклик (требует аутентификации кандидата)
```json
{
  "jobId": "job-id",
  "coverLetter": "Сопроводительное письмо",
  "resumeUrl": "https://example.com/resume.pdf"
}
```

### PATCH /applications/:id
Обновить статус отклика (требует аутентификации HR)
```json
{
  "status": "REVIEWED" | "ACCEPTED" | "REJECTED" | "INTERVIEW_SCHEDULED" | "HIRED",
  "notes": "Заметки HR"
}
```

### DELETE /applications/:id
Удалить отклик (требует аутентификации кандидата)

## Навыки

### GET /skills
Получить список всех навыков

### GET /skills/:id
Получить навык по ID

### POST /skills
Создать новый навык (требует аутентификации)
```json
{
  "name": "JavaScript",
  "category": "Programming",
  "description": "Язык программирования"
}
```

### PATCH /skills/:id
Обновить навык (требует аутентификации)

### DELETE /skills/:id
Удалить навык (требует аутентификации)

## Навыки кандидатов

### GET /skills/candidate/:candidateId
Получить навыки кандидата

### POST /skills/candidate/:candidateId
Добавить навык кандидату (требует аутентификации)
```json
{
  "skillId": "skill-id",
  "level": 3
}
```

### PATCH /skills/candidate/:candidateId/:skillId
Обновить уровень навыка кандидата (требует аутентификации)

### DELETE /skills/candidate/:candidateId/:skillId
Удалить навык кандидата (требует аутентификации)

## Навыки студентов

### GET /skills/student/:studentId
Получить навыки студента

### POST /skills/student/:studentId
Добавить навык студенту (требует аутентификации)
```json
{
  "skillId": "skill-id",
  "level": 3
}
```

### PATCH /skills/student/:studentId/:skillId
Обновить уровень навыка студента (требует аутентификации)

### DELETE /skills/student/:studentId/:skillId
Удалить навык студента (требует аутентификации)

## Университеты и студенты

### GET /universities/students
Получить список студентов университета (требует аутентификации университета)

### GET /universities/students/search?skillIds=skill1,skill2
Поиск студентов по навыкам (требует аутентификации университета)

### GET /universities/students/stats
Получить статистику по студентам (требует аутентификации университета)

### GET /universities/students/:id
Получить студента по ID (требует аутентификации университета)

### POST /universities/students
Создать нового студента (требует аутентификации университета)
```json
{
  "firstName": "Иван",
  "lastName": "Иванов",
  "email": "ivan@university.edu",
  "studentId": "12345",
  "yearOfStudy": 3,
  "major": "Computer Science",
  "gpa": 4.5,
  "phone": "+7-999-123-45-67"
}
```

### PATCH /universities/students/:id
Обновить данные студента (требует аутентификации университета)

### DELETE /universities/students/:id
Удалить студента (требует аутентификации университета)

## Статусы и типы

### Статусы откликов (ApplicationStatus)
- PENDING - Ожидает рассмотрения
- REVIEWED - Рассмотрен
- ACCEPTED - Принят
- REJECTED - Отклонен
- INTERVIEW_SCHEDULED - Запланировано собеседование
- HIRED - Принят на работу

### Типы вакансий (JobType)
- FULL_TIME - Полная занятость
- PART_TIME - Частичная занятость
- INTERNSHIP - Стажировка
- CONTRACT - Контракт

### Уровни опыта (ExperienceLevel)
- ENTRY - Начальный
- JUNIOR - Младший
- MIDDLE - Средний
- SENIOR - Старший
- LEAD - Ведущий

### Статусы вакансий (JobStatus)
- ACTIVE - Активная
- PAUSED - Приостановлена
- CLOSED - Закрыта

## Аутентификация

Все защищенные эндпоинты требуют заголовок:
```
Authorization: Bearer <JWT_TOKEN>
```

## Коды ответов

- 200 - Успешно
- 201 - Создано
- 400 - Неверный запрос
- 401 - Не авторизован
- 403 - Доступ запрещен
- 404 - Не найдено
- 409 - Конфликт (например, дублирование)
- 500 - Внутренняя ошибка сервера
