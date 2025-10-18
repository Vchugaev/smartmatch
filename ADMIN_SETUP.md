# Настройка администраторов системы

## 🔐 Безопасность доступа

В системе SmartMatch реализована особая система безопасности для ролей `ADMIN` и `MODERATOR`:

### ❌ Что ЗАПРЕЩЕНО через API:
- Регистрация с ролями `ADMIN` или `MODERATOR`
- Авторизация пользователей с ролями `ADMIN` или `MODERATOR`

### ✅ Как создавать администраторов:

## 1. Через скрипт (Рекомендуется)

Создайте первого администратора через скрипт:

```bash
node scripts/create-admin.js admin@example.com your_secure_password
```

**Пример:**
```bash
node scripts/create-admin.js admin@company.com MySecurePassword123!
```

## 2. Через базу данных напрямую

Если у вас есть доступ к базе данных PostgreSQL:

```sql
-- 1. Создаем пользователя (пароль нужно захешировать)
INSERT INTO users (id, email, password, role, "isActive", "createdAt", "updatedAt")
VALUES (
  'admin_id_here',
  'admin@example.com',
  '$2a$12$hashed_password_here', -- Захешированный пароль
  'ADMIN',
  true,
  NOW(),
  NOW()
);

-- 2. Создаем профиль администратора
INSERT INTO admin_profiles (id, "userId", "firstName", "lastName", position, department, "createdAt", "updatedAt")
VALUES (
  'profile_id_here',
  'admin_id_here',
  'Системный',
  'Администратор',
  'Главный администратор',
  'IT',
  NOW(),
  NOW()
);
```

## 3. Через Prisma Studio

1. Откройте Prisma Studio: `npx prisma studio`
2. Перейдите в таблицу `users`
3. Создайте нового пользователя с ролью `ADMIN`
4. Перейдите в таблицу `admin_profiles`
5. Создайте профиль для администратора

## 🔄 Создание дополнительных администраторов

После создания первого администратора, он может создавать других пользователей через админ-панель:

### Через API (только для существующих админов):

```http
POST /admin/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "newadmin@example.com",
  "password": "secure_password",
  "role": "ADMIN"
}
```

### Через админ-панель:
1. Войдите в систему как администратор
2. Перейдите в раздел "Управление пользователями"
3. Нажмите "Создать пользователя"
4. Заполните данные и выберите роль `ADMIN`

## 🛡️ Безопасность

### Рекомендации по паролям:
- Минимум 12 символов
- Смесь букв, цифр и специальных символов
- Уникальный пароль для каждого администратора
- Регулярная смена паролей

### Управление доступом:
- Создавайте администраторов только при необходимости
- Регулярно проверяйте список активных администраторов
- Деактивируйте неиспользуемые аккаунты
- Ведите журнал действий администраторов

## 📋 Проверка администраторов

Проверить список администраторов:

```sql
SELECT u.email, u.role, u."isActive", u."lastLogin", 
       ap."firstName", ap."lastName", ap.position
FROM users u
LEFT JOIN admin_profiles ap ON u.id = ap."userId"
WHERE u.role = 'ADMIN';
```

## 🚨 Восстановление доступа

Если потерян доступ к администратору:

1. **Через базу данных:**
   ```sql
   -- Обновить пароль (нужно захешировать)
   UPDATE users 
   SET password = '$2a$12$new_hashed_password'
   WHERE email = 'admin@example.com';
   ```

2. **Создать нового администратора:**
   ```bash
   node scripts/create-admin.js recovery@example.com recovery_password
   ```

3. **Деактивировать старый аккаунт:**
   ```sql
   UPDATE users 
   SET "isActive" = false 
   WHERE email = 'old_admin@example.com';
   ```

## 📝 Логирование

Все действия администраторов логируются:
- Создание пользователей
- Изменение ролей
- Системные настройки
- Доступ к админ-функциям

Логи доступны в админ-панели в разделе "Аудит".

## ⚠️ Важные замечания

1. **Первый администратор** должен быть создан через скрипт или базу данных
2. **Пароли** должны быть захешированы с помощью bcrypt
3. **Email** должен быть уникальным в системе
4. **Роль ADMIN** дает полный доступ ко всем функциям системы
5. **Регулярно проверяйте** активность администраторов
