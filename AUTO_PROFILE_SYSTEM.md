# 🤖 Система автоматического создания профилей

## Обзор

Система автоматически создает профили для всех типов пользователей, решая проблему "Foreign key constraint violated" и улучшая пользовательский опыт.

## 🎯 Проблема, которую решает

**До исправления:**
- При создании вакансии возникала ошибка: `Foreign key constraint violated on the constraint: jobs_hrId_fkey`
- Пользователи должны были вручную создавать профили
- Неудобный пользовательский опыт

**После исправления:**
- ✅ Автоматическое создание профилей при регистрации
- ✅ Автоматическое создание профилей при необходимости
- ✅ Универсальная система для всех типов пользователей
- ✅ Нет ошибок внешнего ключа

## 🏗️ Архитектура

### AutoProfileService
Универсальный сервис для автоматического создания профилей:

```typescript
// Основные методы
ensureProfileExists(userId: string, userRole: UserRole): Promise<string>
getProfileId(userId: string, userRole: UserRole): Promise<string>
```

### Поддерживаемые типы профилей:
- **HR** → `HRProfile`
- **CANDIDATE** → `CandidateProfile` 
- **UNIVERSITY** → `UniversityProfile`

## 🔧 Интеграция

### 1. При регистрации пользователя
```typescript
// AuthService.register()
const user = await this.prisma.user.create({...});

// Автоматически создаем профиль
await this.autoProfileService.ensureProfileExists(user.id, role);
```

### 2. При создании вакансии
```typescript
// JobsService.create()
const hrProfileId = await this.autoProfileService.getProfileId(userId, user.role);
```

### 3. При любых операциях с профилями
```typescript
// Любой сервис может использовать
const profileId = await this.autoProfileService.getProfileId(userId, userRole);
```

## 📋 Базовые профили

### HR Профиль
```typescript
{
  firstName: 'HR',
  lastName: 'Manager', 
  company: 'Компания',
  position: 'HR Manager'
}
```

### Кандидат Профиль
```typescript
{
  firstName: 'Кандидат',
  lastName: 'Соискатель',
  isAvailable: true
}
```

### Университет Профиль
```typescript
{
  name: 'Университет',
  address: 'Адрес университета'
}
```

## 🧪 Тестирование

### Веб-интерфейс
Откройте `test-auto-profiles.html` для интерактивного тестирования:

1. **Регистрация HR** → автоматическое создание HR профиля
2. **Регистрация кандидата** → автоматическое создание Candidate профиля  
3. **Регистрация университета** → автоматическое создание University профиля
4. **Создание вакансии** → автоматическое создание HR профиля если нужно

### API тестирование
```bash
# 1. Регистрация HR
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"hr@test.com","password":"password","role":"HR"}'

# 2. Создание вакансии (профиль создается автоматически)
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=TOKEN" \
  -d '{"title":"Developer","description":"Job","location":"Moscow","type":"FULL_TIME","experienceLevel":"JUNIOR"}'
```

## 🔄 Логика работы

1. **Проверка существования** - ищет существующий профиль
2. **Создание при необходимости** - создает базовый профиль если не найден
3. **Возврат ID** - возвращает ID профиля для использования
4. **Обработка ошибок** - graceful handling ошибок

## 🎉 Преимущества

- **🚀 Улучшенный UX** - пользователи не должны создавать профили вручную
- **🔧 Автоматизация** - система сама управляет профилями
- **🛡️ Надежность** - нет ошибок внешнего ключа
- **🔄 Универсальность** - работает для всех типов пользователей
- **📈 Масштабируемость** - легко добавить новые типы профилей

## 🔮 Будущие улучшения

- [ ] Настраиваемые шаблоны профилей
- [ ] Валидация данных профиля
- [ ] Уведомления о создании профиля
- [ ] Аналитика использования профилей
- [ ] Миграция существующих пользователей
