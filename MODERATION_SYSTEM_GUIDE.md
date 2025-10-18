# Система модерации и ролей

Полное руководство по системе модерации и управлению ролями в SmartMatch.

## 🔐 Обзор

Система включает в себя роли пользователей и автоматическую модерацию вакансий:

- **ADMIN** - полный доступ ко всем функциям системы
- **MODERATOR** - доступ к модерации вакансий
- **HR** - создание вакансий (требуют модерации)
- **CANDIDATE** - просмотр и отклик на вакансии
- **UNIVERSITY** - управление студентами
- **ANALYST** - доступ к аналитике

## 👥 Роли и права доступа

### ADMIN (Администратор)
- Полный доступ ко всем функциям
- Управление пользователями
- Назначение ролей
- Системные настройки
- Модерация вакансий
- Аналитика и статистика
- Массовые операции
- Управление системными параметрами

### MODERATOR (Модератор)
- Модерация вакансий (одобрение/отклонение)
- Просмотр статистики модерации
- История модерации
- Просмотр деталей вакансий
- Комментирование решений

### HR (Работодатель)
- Создание вакансий (попадают на модерацию)
- Просмотр своих вакансий
- Управление откликами
- Редактирование черновиков
- Просмотр статуса модерации

### CANDIDATE (Соискатель)
- Просмотр одобренных вакансий
- Отклик на вакансии
- Управление своим профилем
- Просмотр статуса откликов

### UNIVERSITY (Университет)
- Управление студентами
- Просмотр навыков студентов
- Поиск по навыкам
- Управление профилем университета

### ANALYST (Аналитик)
- Доступ к аналитике
- Просмотр статистики
- Генерация отчетов
- Анализ трендов

## 🔗 API Эндпоинты

### Аутентификация
```
POST /auth/register - Регистрация
POST /auth/login - Вход
GET /auth/me - Профиль пользователя
POST /auth/logout - Выход
```

### Модерация (только MODERATOR и ADMIN)

#### Список вакансий на модерацию
```
GET /moderator/jobs
```
**Параметры:**
- `status` - статус модерации (PENDING, APPROVED, REJECTED, DRAFT)
- `page` - страница (по умолчанию 1)
- `limit` - количество на странице (по умолчанию 20)
- `sortBy` - сортировка (createdAt, title, company)
- `sortOrder` - порядок (asc, desc)

#### Детали вакансии
```
GET /moderator/jobs/:id
```

#### Одобрить вакансию
```
PATCH /moderator/jobs/:id/approve
```
**Тело запроса:**
```json
{
  "notes": "Вакансия соответствует требованиям"
}
```

#### Отклонить вакансию
```
PATCH /moderator/jobs/:id/reject
```
**Тело запроса:**
```json
{
  "reason": "Несоответствие требованиям",
  "notes": "Детальное описание причин отклонения"
}
```

#### Вернуть на доработку
```
PATCH /moderator/jobs/:id/return
```
**Тело запроса:**
```json
{
  "notes": "Требуется доработка описания"
}
```

#### Статистика модерации
```
GET /moderator/stats
```

#### История модерации
```
GET /moderator/history
```

### Админ панель (только ADMIN)

#### Управление модерацией
```
GET /admin/moderation/jobs - Вакансии на модерацию
PATCH /admin/moderation/jobs/:id/approve - Одобрить вакансию
PATCH /admin/moderation/jobs/:id/reject - Отклонить вакансию
PATCH /admin/moderation/jobs/:id/return - Вернуть на доработку
PATCH /admin/moderation/bulk-approve - Массовое одобрение
PATCH /admin/moderation/bulk-reject - Массовое отклонение
```

#### Аналитика
```
GET /admin/analytics/overview - Общая статистика
GET /admin/analytics/companies - Статистика по компаниям
GET /admin/analytics/universities - Статистика по университетам
GET /admin/analytics/skills - Статистика по навыкам
GET /admin/analytics/jobs - Статистика по вакансиям
GET /admin/analytics/applications - Статистика по откликам
```

#### Управление пользователями
```
GET /admin/users - Список пользователей
GET /admin/users/:id - Детали пользователя
PATCH /admin/users/:id/role - Назначить роль
PATCH /admin/users/:id/activate - Активировать пользователя
PATCH /admin/users/:id/deactivate - Деактивировать пользователя
DELETE /admin/users/:id - Удалить пользователя
```

#### Системные настройки
```
GET /admin/settings - Получить настройки
PATCH /admin/settings - Обновить настройки
GET /admin/audit-logs - Логи аудита
```

### Вакансии
```
POST /jobs - Создать вакансию (требует модерации)
GET /jobs - Список одобренных вакансий
GET /jobs/my - Мои вакансии (для HR)
GET /jobs/:id - Детали вакансии
PATCH /jobs/:id - Обновить вакансию
DELETE /jobs/:id - Удалить вакансию
```

## 🔄 Процесс модерации

### 1. Создание вакансии
- HR создает вакансию через `POST /jobs`
- Вакансия автоматически получает статус `PENDING` (на модерации)
- Статус вакансии устанавливается в `DRAFT` (черновик)
- `publishedAt` остается `null` до одобрения
- HR получает уведомление о том, что вакансия отправлена на модерацию

### 2. Модерация
- Модератор/Админ просматривает вакансии через `GET /moderator/jobs`
- Может одобрить (`APPROVED`), отклонить (`REJECTED`) или вернуть на доработку (`DRAFT`)
- При одобрении:
  - Статус модерации: `APPROVED`
  - Статус вакансии: `ACTIVE`
  - Устанавливается `publishedAt`
  - HR получает уведомление об одобрении
- При отклонении:
  - Статус модерации: `REJECTED`
  - Статус вакансии: `CLOSED`
  - HR получает уведомление с причиной отклонения
- При возврате на доработку:
  - Статус модерации: `DRAFT`
  - Статус вакансии: `DRAFT`
  - HR получает уведомление с комментариями

### 3. Публикация
- Только одобренные вакансии (`APPROVED`) отображаются в публичном списке
- Пользователи видят только активные и одобренные вакансии
- Вакансии доступны для откликов

### 4. Доработка (если возвращена)
- HR может редактировать вакансию через `PATCH /jobs/:id`
- После изменений вакансия снова попадает на модерацию
- Статус модерации сбрасывается на `PENDING`

## 📊 Статусы модерации

| Статус | Описание | Действия |
|--------|----------|----------|
| `PENDING` | Ожидает модерации | Модератор может одобрить/отклонить/вернуть |
| `APPROVED` | Одобрена модератором | Вакансия опубликована, доступна для откликов |
| `REJECTED` | Отклонена модератором | Вакансия закрыта, HR уведомлен |
| `DRAFT` | Возвращена на доработку | HR может редактировать и повторно отправить |

## 📋 Статусы вакансий

| Статус | Описание | Видимость |
|--------|----------|-----------|
| `DRAFT` | Черновик (не опубликована) | Только для HR |
| `ACTIVE` | Активная (опубликована) | Публично доступна |
| `PAUSED` | Приостановлена | Только для HR |
| `CLOSED` | Закрыта | Архивная |
| `ARCHIVED` | Архивирована | Архивная |

## 🔄 Переходы статусов

### Модерация
```
PENDING → APPROVED (одобрение)
PENDING → REJECTED (отклонение)
PENDING → DRAFT (возврат на доработку)
DRAFT → PENDING (повторная отправка)
```

### Вакансии
```
DRAFT → ACTIVE (после одобрения)
ACTIVE → PAUSED (приостановка HR)
ACTIVE → CLOSED (закрытие HR)
PAUSED → ACTIVE (возобновление)
CLOSED → ARCHIVED (архивирование)
```

## 🛡️ Guards и декораторы

### Использование в контроллерах
```typescript
@Controller('moderator')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MODERATOR, UserRole.ADMIN)
export class ModeratorController {
  // ...
}
```

### Проверка ролей
```typescript
@Get('admin-only')
@Roles(UserRole.ADMIN)
async adminOnly() {
  // Только для админов
}
```

## 📝 Примеры запросов

### Создание вакансии (HR)
```bash
curl -X POST http://localhost:3000/jobs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Frontend Developer",
    "description": "Разработка пользовательских интерфейсов",
    "requirements": "React, TypeScript, 2+ года опыта",
    "salaryMin": 80000,
    "salaryMax": 120000,
    "location": "Москва",
    "type": "FULL_TIME",
    "experienceLevel": "MIDDLE",
    "skillIds": ["skill1", "skill2"]
  }'
```

### Одобрение вакансии (Модератор)
```bash
curl -X PATCH http://localhost:3000/moderator/jobs/job123/approve \
  -H "Authorization: Bearer <moderator_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Вакансия соответствует требованиям"
  }'
```

### Отклонение вакансии (Модератор)
```bash
curl -X PATCH http://localhost:3000/moderator/jobs/job123/reject \
  -H "Authorization: Bearer <moderator_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Несоответствие требованиям",
    "notes": "Требуется более детальное описание обязанностей"
  }'
```

### Возврат на доработку (Модератор)
```bash
curl -X PATCH http://localhost:3000/moderator/jobs/job123/return \
  -H "Authorization: Bearer <moderator_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Требуется доработка описания и требований"
  }'
```

### Массовое одобрение (Админ)
```bash
curl -X PATCH http://localhost:3000/admin/moderation/bulk-approve \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "jobIds": ["job1", "job2", "job3"],
    "notes": "Массовое одобрение проверенных вакансий"
  }'
```

### Получение статистики модерации
```bash
curl -X GET http://localhost:3000/moderator/stats \
  -H "Authorization: Bearer <moderator_token>"
```

**Ответ:**
```json
{
  "totalJobs": 150,
  "pendingJobs": 25,
  "approvedJobs": 100,
  "rejectedJobs": 20,
  "draftJobs": 5,
  "moderationRate": 0.8,
  "averageModerationTime": "2.5 hours"
}
```

## 📊 Аудит и логирование

Все действия модерации записываются в `AuditLog`:

### Структура лога
```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: any;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}
```

### Типы действий
- `JOB_CREATED` - Создание вакансии
- `JOB_APPROVED` - Одобрение вакансии
- `JOB_REJECTED` - Отклонение вакансии
- `JOB_RETURNED` - Возврат на доработку
- `BULK_APPROVE` - Массовое одобрение
- `BULK_REJECT` - Массовое отклонение
- `USER_ROLE_CHANGED` - Изменение роли пользователя

### Получение логов аудита
```bash
curl -X GET http://localhost:3000/admin/audit-logs \
  -H "Authorization: Bearer <admin_token>"
```

## 🔔 Уведомления

### Типы уведомлений

#### Для HR
- **Вакансия отправлена на модерацию** - при создании
- **Вакансия одобрена** - при одобрении
- **Вакансия отклонена** - при отклонении с причиной
- **Вакансия возвращена** - при возврате на доработку

#### Для модераторов
- **Новая вакансия на модерацию** - при создании HR
- **Вакансия повторно отправлена** - после доработки

#### Для админов
- **Сводка по модерации** - ежедневно
- **Критические события** - немедленно

### Настройка уведомлений
```typescript
interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}
```

## 🔒 Безопасность

### Аутентификация и авторизация
- Все эндпоинты модерации защищены JWT аутентификацией
- Проверка ролей на уровне контроллера и метода
- Валидация токенов и проверка срока действия

### Аудит безопасности
- Аудит всех действий модерации
- Логирование попыток несанкционированного доступа
- Отслеживание изменений ролей пользователей

### Валидация данных
- Валидация входных данных на всех уровнях
- Проверка прав доступа к ресурсам
- Санитизация пользовательского ввода

### Защита от злоупотреблений
- Rate limiting для API эндпоинтов
- Защита от массовых операций
- Ограничения на количество запросов

### Конфиденциальность
- Шифрование чувствительных данных
- Безопасное хранение логов
- Соблюдение GDPR требований

## 📈 Мониторинг и аналитика

### Ключевые метрики
- Время модерации вакансий
- Процент одобренных/отклоненных вакансий
- Активность модераторов
- Статистика по компаниям

### Дашборд модератора
```typescript
interface ModeratorDashboard {
  pendingJobs: number;
  todayProcessed: number;
  approvalRate: number;
  averageTime: string;
  recentActivity: ActivityLog[];
}
```

### Админ панель
```typescript
interface AdminDashboard {
  totalUsers: number;
  activeJobs: number;
  moderationQueue: number;
  systemHealth: SystemHealth;
  recentAlerts: Alert[];
}
```
