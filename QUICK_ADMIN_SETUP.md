# 🚀 Быстрая настройка администратора

## 1. Создание администратора через API

Теперь администраторы могут регистрироваться и входить через обычный API:

```bash
# Регистрация администратора через API
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "YourSecurePassword123!",
    "role": "ADMIN"
  }'

# Авторизация администратора через API
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "YourSecurePassword123!"
  }'
```

## 2. Альтернативный способ - через скрипт

```bash
# Установите зависимости (если еще не установлены)
npm install

# Создайте первого администратора через скрипт
node scripts/create-admin.js admin@yourcompany.com YourSecurePassword123!
```

## 3. Проверка доступа

```bash
# Запустите тесты доступа
node test-admin-restrictions.js
```

## 4. Что происходит после создания

✅ **Администратор создан**
- Email: `admin@yourcompany.com`
- Роль: `ADMIN`
- Профиль: `AdminProfile` с базовыми данными
- **Может входить через API** `/auth/login`

✅ **Разрешено через API:**
- Регистрация с ролями `ADMIN`/`MODERATOR`
- Авторизация пользователей с ролями `ADMIN`/`MODERATOR`

## 5. Доступ к системе

Администратор **МОЖЕТ** войти через обычный API `/auth/login` и получить JWT токен для доступа к админ-функциям.

## 6. Создание дополнительных пользователей

Администратор может создавать других пользователей через:
- Админ-панель (если реализована)
- API endpoints для управления пользователями
- Прямую работу с базой данных

## ⚠️ Важно

- Все роли (HR, CANDIDATE, UNIVERSITY, ADMIN, MODERATOR) теперь доступны через API
- Администраторы получают полный доступ к системе после авторизации
- Регулярно проверяйте активность администраторов
