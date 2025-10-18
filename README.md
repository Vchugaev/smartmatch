# SmartMatch - Платформа для подбора персонала и стажировок

Платформа для подбора персонала и стажировок для резидентов ОЭЗ с поддержкой ролей HR, соискателей и университетов.

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка базы данных
1. Создайте базу данных PostgreSQL
2. Скопируйте `env.example` в `.env` и настройте переменные:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/smartmatch?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
```

### 3. Инициализация базы данных
```bash
# Генерация Prisma клиента
npx prisma generate

# Применение миграций
npx prisma migrate dev

# (Опционально) Заполнение тестовыми данными
npx prisma db seed
```

### 4. Запуск приложения
```bash
# Разработка
npm run start:dev

# Продакшн
npm run build
npm run start:prod
```

## 📚 Документация API

### Основные руководства
- **[API_GUIDE.md](./API_GUIDE.md)** - Полная документация API с примерами
- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Аутентификация и авторизация
- **[PROFILES.md](./PROFILES.md)** - Управление профилями пользователей
- **[JOBS.md](./JOBS.md)** - Вакансии и отклики
- **[EDUCATIONS_EXPERIENCES.md](./EDUCATIONS_EXPERIENCES.md)** - Образование и опыт
- **[SKILLS.md](./SKILLS.md)** - Управление навыками
- **[STORAGE.md](./STORAGE.md)** - Загрузка и управление файлами
- **[MODERATION.md](./MODERATION.md)** - Система модерации
- **[FRONTEND_EXAMPLES.md](./FRONTEND_EXAMPLES.md)** - Примеры кода для фронтенда

### Быстрый справочник API

#### 🔐 Аутентификация
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

#### 👤 Профили
```bash
# Получить профиль
GET /profiles/candidate
Authorization: Bearer <token>

# Создать профиль
POST /profiles/candidate
Authorization: Bearer <token>
{
  "firstName": "Анна",
  "lastName": "Смирнова",
  "phone": "+7-999-123-45-67"
}
```

#### 💼 Вакансии
```bash
# Список вакансий
GET /jobs?search=frontend&location=Москва

# Создать вакансию
POST /jobs
Authorization: Bearer <token>
{
  "title": "Frontend Developer",
  "description": "Описание вакансии",
  "location": "Москва",
  "type": "FULL_TIME"
}
```

## 🛠 Технологии

- **Backend**: NestJS + TypeScript
- **База данных**: PostgreSQL + Prisma ORM
- **Аутентификация**: JWT с HTTP-only cookies
- **Валидация**: class-validator, class-transformer
- **Файлы**: MinIO S3-совместимое хранилище
- **Модерация**: Система ролей и статусов

## 👥 Роли пользователей

- **HR** - создание вакансий и управление откликами
- **CANDIDATE** - заполнение резюме и отклики на вакансии  
- **UNIVERSITY** - управление студентами и их навыками
- **ADMIN** - полный доступ к системе
- **MODERATOR** - модерация вакансий

## 🔄 Основные процессы

### Для соискателей
1. Регистрация → Создание профиля → Заполнение навыков/опыта
2. Просмотр вакансий → Отклик на вакансию → Отслеживание статуса

### Для HR
1. Регистрация → Создание профиля → Создание вакансии
2. Модерация вакансии → Просмотр откликов → Управление кандидатами

### Для университетов
1. Регистрация → Создание профиля → Добавление студентов
2. Управление навыками студентов → Поиск по навыкам

## 📁 Структура проекта

```
src/
├── dto/                    # DTO для валидации
├── interfaces/            # TypeScript интерфейсы
├── modules/              # Модули NestJS
│   ├── auth/             # Аутентификация
│   ├── profiles/         # Профили пользователей
│   ├── jobs/             # Вакансии
│   ├── applications/     # Отклики
│   ├── skills/           # Навыки
│   ├── educations/       # Образование
│   ├── experiences/      # Опыт работы
│   ├── universities/     # Университеты
│   ├── storage/          # Файловое хранилище
│   ├── moderator/        # Модерация
│   └── admin/            # Администрирование
└── main.ts               # Точка входа
```

## 🗄 База данных

Основные сущности:
- **Users** - пользователи системы
- **HRProfile** - профили HR
- **CandidateProfile** - профили соискателей
- **UniversityProfile** - профили университетов
- **Students** - студенты
- **Jobs** - вакансии
- **Applications** - отклики на вакансии
- **Skills** - навыки
- **Educations** - образование
- **Experiences** - опыт работы

## 🔧 Разработка

### Добавление новых эндпоинтов
1. Создайте DTO в `src/dto/`
2. Создайте сервис в соответствующем модуле
3. Создайте контроллер
4. Обновите модуль

### Миграции базы данных
```bash
# Создание миграции
npx prisma migrate dev --name migration_name

# Сброс базы данных
npx prisma migrate reset
```

## 📞 Поддержка

Для вопросов по API обращайтесь к соответствующим руководствам или создавайте issue в репозитории.

## Лицензия

MIT