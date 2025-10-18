# API для профилей администраторов и модераторов

## 🔐 Аутентификация

Все endpoints требуют JWT токен в заголовке:
```
Authorization: Bearer <your_jwt_token>
```

## 👑 Endpoints для администраторов

### GET /profiles/admin
Получить профиль администратора

**Требования:**
- Роль пользователя: `ADMIN`
- JWT токен в заголовке

**Ответ:**
```json
{
  "id": "profile_id",
  "userId": "user_id",
  "firstName": "Администратор",
  "lastName": "Системы",
  "position": "Системный администратор",
  "department": "IT",
  "phone": "+7 (999) 123-45-67",
  "avatarId": null,
  "permissions": null,
  "createdAt": "2025-10-18T16:49:17.000Z",
  "updatedAt": "2025-10-18T16:49:17.000Z",
  "user": {
    "id": "user_id",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "avatar": null
}
```

### PATCH /profiles/admin
Обновить профиль администратора

**Тело запроса:**
```json
{
  "firstName": "Главный",
  "lastName": "Администратор",
  "position": "Системный администратор",
  "department": "IT отдел",
  "phone": "+7 (999) 123-45-67"
}
```

**Ответ:** Обновленный профиль администратора

## 🛡️ Endpoints для модераторов

### GET /profiles/moderator
Получить профиль модератора

**Требования:**
- Роль пользователя: `MODERATOR`
- JWT токен в заголовке

**Ответ:**
```json
{
  "id": "profile_id",
  "userId": "user_id",
  "firstName": "Модератор",
  "lastName": "Контента",
  "position": "Модератор",
  "department": "Модерация",
  "phone": null,
  "avatarId": null,
  "permissions": null,
  "createdAt": "2025-10-18T16:49:17.000Z",
  "updatedAt": "2025-10-18T16:49:17.000Z",
  "user": {
    "id": "user_id",
    "email": "moderator@example.com",
    "role": "MODERATOR"
  },
  "avatar": null
}
```

### PATCH /profiles/moderator
Обновить профиль модератора

**Тело запроса:**
```json
{
  "firstName": "Старший",
  "lastName": "Модератор",
  "position": "Ведущий модератор",
  "department": "Контент-модерация",
  "phone": "+7 (999) 987-65-43"
}
```

**Ответ:** Обновленный профиль модератора

## 🔒 Контроль доступа

### Ошибки доступа:

**403 Forbidden** - Неправильная роль:
```json
{
  "statusCode": 403,
  "message": "Only ADMIN users can access admin profile"
}
```

**401 Unauthorized** - Отсутствует или неверный токен:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## 📝 Примеры использования

### 1. Получение профиля администратора
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/profiles/admin
```

### 2. Обновление профиля администратора
```bash
curl -X PATCH \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Главный", "lastName": "Админ"}' \
  http://localhost:3000/profiles/admin
```

### 3. Получение профиля модератора
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/profiles/moderator
```

## 🧪 Тестирование

Запустите тест для проверки всех endpoints:

```bash
node test-admin-endpoints.js
```

## ⚠️ Важные замечания

1. **Роли проверяются строго** - только ADMIN может получить `/profiles/admin`
2. **Профили создаются автоматически** при регистрации
3. **Все поля опциональны** при обновлении
4. **Аватары поддерживаются** через общие endpoints `/profiles/avatar/*`
5. **Права доступа** настраиваются через поле `permissions` (JSON)

## 🔄 Автоматическое создание профилей

При регистрации пользователя с ролью `ADMIN` или `MODERATOR` автоматически создается соответствующий профиль с базовыми данными:

**AdminProfile:**
- firstName: "Администратор"
- lastName: "Системы"
- position: "Системный администратор"
- department: "IT"

**ModeratorProfile:**
- firstName: "Модератор"
- lastName: "Контента"
- position: "Модератор"
- department: "Модерация"
