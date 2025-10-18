# 🔧 Исправление ошибки с полем url в резюме

## Проблема

При создании отклика на вакансию возникала ошибка:

```
Unknown field `url` for select statement on model `Resume`. Available options are marked with ?.
```

## Причина

В константе `APPLICATION_INCLUDE_FULL` в файле `src/shared/constants/prisma-fragments.ts` использовались устаревшие поля резюме:

```typescript
resumes: {
  where: { isDefault: true },
  select: {
    id: true,
    url: true,           // ❌ Это поле не существует в новой модели Resume
    originalName: true, // ❌ Это поле не существует в новой модели Resume
    mimeType: true,     // ❌ Это поле не существует в новой модели Resume
    size: true,         // ❌ Это поле не существует в новой модели Resume
  },
},
```

## Решение

Обновлена константа `APPLICATION_INCLUDE_FULL` для использования актуальных полей модели `Resume`:

```typescript
resumes: {
  where: { isDefault: true },
  select: {
    id: true,
    title: true,           // ✅ Название резюме
    summary: true,         // ✅ Краткое описание
    objective: true,        // ✅ Цель поиска работы
    skills: true,          // ✅ Навыки (JSON)
    experiences: true,     // ✅ Опыт работы (JSON)
    educations: true,      // ✅ Образование (JSON)
    projects: true,         // ✅ Проекты (JSON)
    achievements: true,     // ✅ Достижения (JSON)
    languages: true,       // ✅ Языки (JSON)
    certifications: true,  // ✅ Сертификаты (JSON)
    isDefault: true,       // ✅ Основное резюме
    isPublic: true,        // ✅ Публичное резюме
    createdAt: true,       // ✅ Дата создания
    updatedAt: true,       // ✅ Дата обновления
  },
},
```

## Изменения в файлах

### `src/shared/constants/prisma-fragments.ts`

- Обновлена константа `APPLICATION_INCLUDE_FULL`
- Удалены устаревшие поля: `url`, `originalName`, `mimeType`, `size`
- Добавлены актуальные поля структурированного резюме

## Результат

✅ **Исправлено**: Ошибка "Unknown field `url`" больше не возникает  
✅ **Совместимость**: API теперь работает с новой моделью структурированных резюме  
✅ **Функциональность**: Отклики на вакансии работают корректно  
✅ **Данные**: Возвращается полная информация о структурированном резюме  

## Тестирование

Для проверки исправления используйте:

```bash
node test-application-fix.js
```

Этот тест проверяет:
- Создание структурированного резюме
- Создание отклика на вакансию
- Получение деталей отклика
- Отсутствие ошибок с полем `url`

## Примечания

- Старые файловые резюме все еще поддерживаются через другие API
- Новые структурированные резюме используют JSON поля для хранения данных
- API теперь возвращает полную информацию о резюме в откликах
