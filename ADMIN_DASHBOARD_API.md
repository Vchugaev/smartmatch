# 📊 API для дашборда администратора

## 🔐 Аутентификация
```
Authorization: Bearer <admin_jwt_token>
```

**Требования:** Роль `ADMIN`

---

## 📈 1. Общая статистика (Overview)

### GET /admin/analytics/overview
Получить общую статистику системы

**Параметры запроса:**
```
?startDate=2025-01-01&endDate=2025-12-31&limit=50
```

**Ответ:**
```json
{
  "totalUsers": 1250,
  "totalJobs": 340,
  "totalApplications": 2100,
  "activeJobs": 280,
  "pendingModeration": 15,
  "newUsersToday": 12,
  "newJobsToday": 8,
  "newApplicationsToday": 45,
  "userGrowth": {
    "thisWeek": 85,
    "lastWeek": 72,
    "growth": 18.1
  },
  "jobGrowth": {
    "thisWeek": 23,
    "lastWeek": 18,
    "growth": 27.8
  },
  "topSkills": [
    { "name": "JavaScript", "count": 156 },
    { "name": "React", "count": 134 },
    { "name": "Python", "count": 98 }
  ],
  "recentActivity": [
    {
      "id": "activity_1",
      "type": "USER_REGISTER",
      "description": "Новый пользователь зарегистрирован",
      "timestamp": "2025-10-18T16:49:17.000Z"
    }
  ]
}
```

---

## 👥 2. Управление пользователями

### GET /admin/users
Получить список пользователей

**Параметры запроса:**
```
?page=1&limit=20&role=HR&isActive=true&search=email@example.com
```

**Ответ:**
```json
{
  "users": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "role": "HR",
      "isActive": true,
      "lastLogin": "2025-10-18T16:49:17.000Z",
      "createdAt": "2025-10-18T16:49:17.000Z",
      "profile": {
        "firstName": "Иван",
        "lastName": "Петров",
        "company": "IT Company"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### PATCH /admin/users/{id}/role
Изменить роль пользователя

**Тело запроса:**
```json
{
  "role": "ADMIN"
}
```

**Ответ:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "ADMIN",
  "isActive": true,
  "updatedAt": "2025-10-18T16:49:17.000Z"
}
```

### PATCH /admin/users/{id}/activate
Активировать пользователя

**Ответ:**
```json
{
  "id": "user_id",
  "isActive": true,
  "updatedAt": "2025-10-18T16:49:17.000Z"
}
```

### PATCH /admin/users/{id}/deactivate
Деактивировать пользователя

**Ответ:**
```json
{
  "id": "user_id",
  "isActive": false,
  "updatedAt": "2025-10-18T16:49:17.000Z"
}
```

---

## 🔍 3. Модерация вакансий

### GET /admin/moderation/jobs
Получить вакансии на модерацию

**Параметры запроса:**
```
?status=PENDING&page=1&limit=20&companyId=company_id
```

**Ответ:**
```json
{
  "jobs": [
    {
      "id": "job_id",
      "title": "Frontend Developer",
      "description": "Описание вакансии...",
      "status": "PENDING",
      "moderationStatus": "PENDING",
      "createdAt": "2025-10-18T16:49:17.000Z",
      "hr": {
        "id": "hr_id",
        "firstName": "Иван",
        "lastName": "Петров",
        "company": "IT Company"
      },
      "skills": [
        { "name": "React", "category": "Frontend" }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

### PATCH /admin/moderation/jobs/{id}/approve
Одобрить вакансию

**Тело запроса:**
```json
{
  "comment": "Вакансия одобрена"
}
```

**Ответ:**
```json
{
  "id": "job_id",
  "moderationStatus": "APPROVED",
  "approvedAt": "2025-10-18T16:49:17.000Z",
  "approvedBy": "admin_id"
}
```

### PATCH /admin/moderation/jobs/{id}/reject
Отклонить вакансию

**Тело запроса:**
```json
{
  "comment": "Несоответствие требованиям"
}
```

**Ответ:**
```json
{
  "id": "job_id",
  "moderationStatus": "REJECTED",
  "rejectedAt": "2025-10-18T16:49:17.000Z",
  "rejectedBy": "admin_id"
}
```

### GET /admin/moderation/stats
Статистика модерации

**Ответ:**
```json
{
  "totalPending": 15,
  "totalApproved": 280,
  "totalRejected": 45,
  "todayPending": 3,
  "thisWeekPending": 12,
  "averageModerationTime": "2.5 hours",
  "moderationTrends": {
    "thisWeek": 18,
    "lastWeek": 15,
    "growth": 20.0
  }
}
```

### PATCH /admin/moderation/bulk-approve
Массовое одобрение вакансий

**Тело запроса:**
```json
{
  "jobIds": ["job_id_1", "job_id_2", "job_id_3"]
}
```

**Ответ:**
```json
{
  "approved": 3,
  "failed": 0,
  "results": [
    { "jobId": "job_id_1", "status": "success" },
    { "jobId": "job_id_2", "status": "success" },
    { "jobId": "job_id_3", "status": "success" }
  ]
}
```

---

## 📊 4. Аналитика

### GET /admin/analytics/companies
Статистика по компаниям

**Ответ:**
```json
{
  "totalCompanies": 45,
  "activeCompanies": 38,
  "topCompanies": [
    {
      "id": "company_id",
      "name": "IT Company",
      "jobsCount": 12,
      "applicationsCount": 156,
      "lastActivity": "2025-10-18T16:49:17.000Z"
    }
  ],
  "companyGrowth": {
    "thisMonth": 8,
    "lastMonth": 6,
    "growth": 33.3
  }
}
```

### GET /admin/analytics/universities
Статистика по университетам

**Ответ:**
```json
{
  "totalUniversities": 25,
  "activeUniversities": 22,
  "totalStudents": 1250,
  "topUniversities": [
    {
      "id": "university_id",
      "name": "МГУ",
      "studentsCount": 156,
      "skillsCount": 45,
      "lastActivity": "2025-10-18T16:49:17.000Z"
    }
  ]
}
```

### GET /admin/analytics/skills
Статистика по навыкам

**Ответ:**
```json
{
  "totalSkills": 150,
  "mostPopularSkills": [
    { "name": "JavaScript", "count": 156, "growth": 12.5 },
    { "name": "React", "count": 134, "growth": 8.3 },
    { "name": "Python", "count": 98, "growth": 15.2 }
  ],
  "skillCategories": [
    { "category": "Frontend", "count": 45 },
    { "category": "Backend", "count": 38 },
    { "category": "DevOps", "count": 25 }
  ]
}
```

### GET /admin/analytics/jobs
Аналитика по вакансиям

**Ответ:**
```json
{
  "totalJobs": 340,
  "activeJobs": 280,
  "closedJobs": 60,
  "jobTypes": [
    { "type": "FULL_TIME", "count": 200 },
    { "type": "PART_TIME", "count": 80 },
    { "type": "INTERNSHIP", "count": 60 }
  ],
  "experienceLevels": [
    { "level": "JUNIOR", "count": 120 },
    { "level": "MIDDLE", "count": 150 },
    { "level": "SENIOR", "count": 70 }
  ],
  "salaryRanges": [
    { "range": "0-50000", "count": 45 },
    { "range": "50000-100000", "count": 120 },
    { "range": "100000+", "count": 115 }
  ]
}
```

### GET /admin/analytics/applications
Аналитика по откликам

**Ответ:**
```json
{
  "totalApplications": 2100,
  "pendingApplications": 150,
  "acceptedApplications": 1800,
  "rejectedApplications": 150,
  "applicationTrends": {
    "thisWeek": 45,
    "lastWeek": 38,
    "growth": 18.4
  },
  "averageResponseTime": "2.3 days",
  "topJobsByApplications": [
    {
      "jobId": "job_id",
      "title": "Frontend Developer",
      "applicationsCount": 25
    }
  ]
}
```

### GET /admin/analytics/users
Аналитика по пользователям

**Ответ:**
```json
{
  "totalUsers": 1250,
  "activeUsers": 1100,
  "userRoles": [
    { "role": "CANDIDATE", "count": 800 },
    { "role": "HR", "count": 300 },
    { "role": "UNIVERSITY", "count": 100 },
    { "role": "ADMIN", "count": 5 },
    { "role": "MODERATOR", "count": 10 }
  ],
  "userActivity": {
    "dailyActiveUsers": 450,
    "weeklyActiveUsers": 850,
    "monthlyActiveUsers": 1100
  },
  "registrationTrends": {
    "thisWeek": 85,
    "lastWeek": 72,
    "growth": 18.1
  }
}
```

### GET /admin/analytics/activity
Аналитика активности

**Ответ:**
```json
{
  "recentActivity": [
    {
      "id": "activity_1",
      "type": "USER_REGISTER",
      "description": "Новый пользователь зарегистрирован",
      "userId": "user_id",
      "timestamp": "2025-10-18T16:49:17.000Z"
    },
    {
      "id": "activity_2",
      "type": "JOB_CREATED",
      "description": "Создана новая вакансия",
      "jobId": "job_id",
      "timestamp": "2025-10-18T16:49:17.000Z"
    }
  ],
  "activityStats": {
    "totalEvents": 15000,
    "eventsToday": 450,
    "eventsThisWeek": 2800,
    "eventsThisMonth": 12000
  }
}
```

---

## ⚙️ 5. Системные настройки

### GET /admin/settings
Получить системные настройки

**Ответ:**
```json
{
  "settings": [
    {
      "key": "max_file_size",
      "value": "10485760",
      "description": "Максимальный размер файла (байты)"
    },
    {
      "key": "job_moderation_required",
      "value": "true",
      "description": "Требуется ли модерация вакансий"
    },
    {
      "key": "registration_enabled",
      "value": "true",
      "description": "Разрешена ли регистрация новых пользователей"
    }
  ]
}
```

### PATCH /admin/settings
Обновить системные настройки

**Тело запроса:**
```json
{
  "settings": [
    {
      "key": "max_file_size",
      "value": "20971520"
    },
    {
      "key": "job_moderation_required",
      "value": "false"
    }
  ]
}
```

**Ответ:**
```json
{
  "updated": 2,
  "settings": [
    {
      "key": "max_file_size",
      "value": "20971520",
      "updatedAt": "2025-10-18T16:49:17.000Z"
    },
    {
      "key": "job_moderation_required",
      "value": "false",
      "updatedAt": "2025-10-18T16:49:17.000Z"
    }
  ]
}
```

---

## 🧪 Примеры использования

### 1. Получить общую статистику
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/admin/analytics/overview
```

### 2. Получить список пользователей
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://localhost:3000/admin/users?page=1&limit=20&role=HR"
```

### 3. Одобрить вакансию
```bash
curl -X PATCH \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Вакансия одобрена"}' \
  http://localhost:3000/admin/moderation/jobs/job_id/approve
```

### 4. Изменить роль пользователя
```bash
curl -X PATCH \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "MODERATOR"}' \
  http://localhost:3000/admin/users/user_id/role
```

---

## 🔒 Требования доступа

- **Роль:** `ADMIN` (обязательно)
- **Аутентификация:** JWT токен в заголовке Authorization
- **Права:** Полный доступ ко всем функциям системы

---

## 📱 Рекомендуемый интерфейс дашборда

### Главная страница:
1. **Общая статистика** - карточки с ключевыми метриками
2. **Графики роста** - пользователи, вакансии, отклики
3. **Последняя активность** - лента событий
4. **Быстрые действия** - одобрить/отклонить вакансии

### Разделы:
1. **Пользователи** - управление пользователями и ролями
2. **Модерация** - вакансии на модерацию
3. **Аналитика** - детальная статистика
4. **Настройки** - системные параметры

**Замените `ADMIN_TOKEN` на ваш JWT токен администратора!** 🚀
