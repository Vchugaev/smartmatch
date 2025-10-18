# 🚀 Быстрый старт: Работа с профилями

## 1. Аутентификация

### Регистрация пользователя
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@example.com",
    "password": "Password123",
    "role": "CANDIDATE"
  }'
```

### Вход в систему
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@example.com",
    "password": "Password123"
  }'
```

## 2. Получение профиля

### Получить свой профиль (универсальный)
```bash
curl -X GET http://localhost:3000/profiles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Получить профиль кандидата
```bash
curl -X GET http://localhost:3000/profiles/candidate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Получить HR профиль
```bash
curl -X GET http://localhost:3000/profiles/hr \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Получить профиль университета
```bash
curl -X GET http://localhost:3000/profiles/university \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 3. Создание профиля

### Создать профиль кандидата
```bash
curl -X POST http://localhost:3000/profiles/candidate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "Анна",
    "lastName": "Смирнова",
    "phone": "+7-999-123-45-67",
    "location": "Москва",
    "bio": "Frontend разработчик с 3 годами опыта"
  }'
```

### Создать HR профиль
```bash
curl -X POST http://localhost:3000/profiles/hr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "Иван",
    "lastName": "Петров",
    "company": "ООО Технологии",
    "position": "HR Manager",
    "phone": "+7-999-123-45-67"
  }'
```

### Создать профиль университета
```bash
curl -X POST http://localhost:3000/profiles/university \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Московский Государственный Университет",
    "address": "Москва, Ленинские горы, 1",
    "phone": "+7-495-939-10-00",
    "website": "https://msu.ru"
  }'
```

## 4. Обновление профиля

### Обновить любой профиль (универсальный)
```bash
curl -X PATCH http://localhost:3000/profiles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "Новое имя",
    "bio": "Обновленное описание",
    "location": "Санкт-Петербург"
  }'
```

## 5. JavaScript примеры

### Базовый класс для работы с API
```javascript
class ProfileAPI {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.token = null;
  }

  async login(email, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    this.token = data.accessToken;
    return data;
  }

  async getProfile() {
    const response = await fetch(`${this.baseURL}/profiles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    return response.json();
  }

  async updateProfile(profileData) {
    const response = await fetch(`${this.baseURL}/profiles`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(profileData)
    });
    
    return response.json();
  }
}

// Использование
const api = new ProfileAPI();

// Вход
await api.login('candidate@example.com', 'Password123');

// Получение профиля
const profile = await api.getProfile();
console.log(profile);

// Обновление профиля
await api.updateProfile({
  bio: 'Новое описание',
  location: 'Москва'
});
```

## 6. Типы профилей и их поля

### HR Профиль
- `firstName` - Имя
- `lastName` - Фамилия  
- `company` - Компания
- `position` - Должность
- `phone` - Телефон
- `avatarId` - ID аватара

### Candidate Профиль
- `firstName` - Имя
- `lastName` - Фамилия
- `phone` - Телефон
- `dateOfBirth` - Дата рождения
- `location` - Местоположение
- `bio` - Биография
- `avatarId` - ID аватара
- `resumeId` - ID резюме
- `linkedinUrl` - LinkedIn URL
- `githubUrl` - GitHub URL
- `portfolioUrl` - Портфолио URL

### University Профиль
- `name` - Название университета
- `address` - Адрес
- `phone` - Телефон
- `website` - Веб-сайт
- `logoId` - ID логотипа

## 7. Обработка ошибок

### Возможные коды ошибок:
- `401` - Неавторизован (неверный токен)
- `403` - Доступ запрещен (неправильная роль)
- `404` - Профиль не найден
- `409` - Профиль уже существует
- `400` - Ошибка валидации

### Пример обработки ошибок в JavaScript:
```javascript
try {
  const profile = await api.getProfile();
  console.log('Профиль:', profile);
} catch (error) {
  if (error.status === 401) {
    console.log('Нужно войти в систему');
  } else if (error.status === 404) {
    console.log('Профиль не найден');
  } else {
    console.log('Ошибка:', error.message);
  }
}
```

## 8. Тестирование

### HTML тест-страница
Откройте файл `examples/profile-test.html` в браузере для интерактивного тестирования API.

### Проверка CORS
```bash
curl -X GET http://localhost:3000/auth/cors-test
```

### Проверка аутентификации
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 9. Загрузка файлов

### Загрузить аватар
```bash
curl -X POST http://localhost:3000/storage/upload \
  -F "file=@avatar.jpg" \
  -F "type=AVATAR"
```

### Использовать загруженный файл в профиле
```bash
curl -X PATCH http://localhost:3000/profiles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "avatarId": "uploaded_file_id"
  }'
```

## 10. Полезные команды

### Получить токен для использования в заголовках
```bash
curl -X GET http://localhost:3000/auth/token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Выход из системы
```bash
curl -X POST http://localhost:3000/auth/logout
```

---

**Готово!** Теперь вы знаете, как работать с API профилей SmartMatch. Для более подробной информации смотрите `PROFILE_API_GUIDE.md`.
