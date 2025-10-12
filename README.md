# SmartMatch - Платформа для подбора персонала и стажировок

Платформа для подбора персонала и стажировок для резидентов ОЭЗ с поддержкой ролей HR, соискателей и университетов.

## Технологии

- **Backend**: NestJS + TypeScript
- **База данных**: PostgreSQL + Prisma ORM
- **Аутентификация**: JWT
- **Валидация**: class-validator, class-transformer

## Функциональность

### Роли пользователей
- **HR** - создание вакансий и управление откликами
- **Соискатели** - заполнение резюме и отклики на вакансии
- **Университеты** - управление студентами и их навыками

### Основные возможности
- Создание и управление вакансиями
- Система откликов на вакансии
- Управление навыками кандидатов и студентов
- Поиск по навыкам и фильтрация
- Статистика и аналитика

## Установка и запуск

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

## API Документация

Полная документация API доступна в файле [API_ENDPOINTS.md](./API_ENDPOINTS.md)

### Основные эндпоинты

#### Аутентификация
- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход

#### Вакансии
- `GET /jobs` - Список вакансий
- `POST /jobs` - Создание вакансии (HR)
- `GET /jobs/:id` - Детали вакансии
- `PATCH /jobs/:id` - Обновление вакансии (HR)
- `DELETE /jobs/:id` - Удаление вакансии (HR)

#### Отклики
- `GET /applications` - Список откликов
- `POST /applications` - Создание отклика (кандидат)
- `PATCH /applications/:id` - Обновление статуса (HR)

#### Навыки
- `GET /skills` - Список навыков
- `POST /skills` - Создание навыка
- `GET /skills/candidate/:id` - Навыки кандидата
- `GET /skills/student/:id` - Навыки студента

#### Университеты
- `GET /universities/students` - Список студентов
- `POST /universities/students` - Добавление студента
- `GET /universities/students/search` - Поиск по навыкам

## Структура проекта

```
src/
├── dto/                    # DTO для валидации
├── interfaces/            # TypeScript интерфейсы
├── modules/              # Модули NestJS
│   ├── auth/             # Аутентификация
│   ├── jobs/             # Вакансии
│   ├── applications/     # Отклики
│   ├── skills/           # Навыки
│   ├── universities/     # Университеты
│   └── prisma/           # Prisma сервис
└── main.ts               # Точка входа
```

## База данных

Схема базы данных включает следующие основные сущности:

- **Users** - пользователи системы
- **HRProfile** - профили HR
- **CandidateProfile** - профили соискателей
- **UniversityProfile** - профили университетов
- **Students** - студенты
- **Jobs** - вакансии
- **Applications** - отклики на вакансии
- **Skills** - навыки
- **CandidateSkills** - навыки кандидатов
- **StudentSkills** - навыки студентов

## Разработка

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

## Лицензия

MIT