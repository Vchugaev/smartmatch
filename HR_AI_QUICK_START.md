# 🚀 Быстрый старт: AI анализ кандидатов для HR

## 📋 Что это?

Система позволяет HR нажать одну кнопку и получить AI анализ всех откликов на вакансию с рейтингом лучших кандидатов.

## ⚡ Быстрый запуск

### 1. Запуск сервера
```bash
npm run start:dev
```

### 2. Тестирование AI анализа
```bash
# Замените токен и ID вакансии в файле
node test-hr-ai-analysis.js
```

### 3. Использование через API

**Анализ всех кандидатов на вакансию:**
```bash
curl -X POST http://localhost:3000/hr-ai/analyze-job-candidates \
  -H "Authorization: Bearer <hr_token>" \
  -H "Content-Type: application/json" \
  -d '{"jobId": "your_job_id"}'
```

## 🎯 Что получает HR

### Результат анализа включает:
- **Рейтинг кандидатов** (1-10 баллов)
- **Соответствие вакансии** (0-100%)
- **Сильные и слабые стороны** каждого кандидата
- **Рекомендации AI** для HR
- **Топ-кандидаты** автоматически отсортированные

### Пример ответа:
```json
{
  "success": true,
  "data": {
    "jobId": "job_123",
    "totalApplications": 25,
    "topCandidates": [
      {
        "candidateId": "candidate_456",
        "overallScore": 9,
        "matchScore": 95,
        "fitLevel": "high",
        "strengths": ["5+ лет React", "Опыт в крупных проектах"],
        "weaknesses": ["Нет GraphQL опыта"],
        "recommendations": ["Приоритетный кандидат", "Техническое интервью"],
        "aiNotes": "Отличный кандидат с сильным техническим бэкграундом"
      }
    ],
    "analysisSummary": "Найдено 3 отличных кандидата. Рекомендуется собеседование с топ-3.",
    "processingTime": 2500
  }
}
```

## 🔧 Настройка

### Переменные окружения
```env
# AI Configuration
OLLAMA_BASE_URL=http://109.73.193.10:11434
```

### Права доступа
- **HR** - может анализировать только свои вакансии
- **ADMIN** - может анализировать любые вакансии

## 📊 Практические примеры

### JavaScript интеграция
```javascript
// Анализ кандидатов на вакансию
async function analyzeCandidates(jobId, hrToken) {
  const response = await fetch('/hr-ai/analyze-job-candidates', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hrToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ jobId })
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log(`Проанализировано ${result.data.totalApplications} кандидатов`);
    console.log(`Лучший кандидат: ${result.data.topCandidates[0].overallScore}/10`);
    
    // Автоматически обновить статус лучших кандидатов
    result.data.topCandidates
      .filter(c => c.overallScore >= 8)
      .forEach(async (candidate) => {
        await updateApplicationStatus(
          candidate.applicationId, 
          'ACCEPTED', 
          `AI рекомендует: ${candidate.aiNotes}`
        );
      });
  }
  
  return result;
}
```

### Массовый анализ всех вакансий
```javascript
async function analyzeAllMyJobs(hrId, hrToken) {
  const jobs = await getMyJobs(hrId);
  const results = [];
  
  for (const job of jobs) {
    try {
      const analysis = await analyzeCandidates(job.id, hrToken);
      results.push({
        jobTitle: job.title,
        totalCandidates: analysis.data.totalApplications,
        topScore: analysis.data.topCandidates[0]?.overallScore || 0
      });
    } catch (error) {
      console.error(`Ошибка анализа ${job.title}:`, error.message);
    }
  }
  
  return results;
}
```

## 🎯 Критерии оценки AI

### Overall Score (1-10)
- **9-10** - Отличный кандидат ⭐⭐⭐
- **7-8** - Хороший кандидат ⭐⭐
- **5-6** - Средний кандидат ⭐
- **1-4** - Слабый кандидат

### Match Score (0-100%)
- **90-100%** - Полное соответствие
- **70-89%** - Хорошее соответствие
- **50-69%** - Частичное соответствие
- **0-49%** - Низкое соответствие

### Fit Level
- **High** - Высокое соответствие
- **Medium** - Среднее соответствие  
- **Low** - Низкое соответствие

## 🛡️ Безопасность

### Ограничения
- Максимум 100 кандидатов за анализ
- Таймаут: 30 секунд
- Лимит: 10 анализов в час на HR

### Приватность
- AI не сохраняет персональные данные
- Анализ в реальном времени
- Данные не передаются третьим лицам

## 📚 Дополнительные ресурсы

- [Полное руководство](./HR_AI_ANALYSIS_GUIDE.md) - Детальная документация
- [Обработка заявок](./HR_APPLICATION_PROCESSING_GUIDE.md) - Управление откликами
- [AI Agent Guide](./AI_AGENT_GUIDE.md) - Общие возможности AI

---

**💡 Совет:** AI анализ - это инструмент для первичной фильтрации. Всегда проводите личные собеседования с кандидатами!
