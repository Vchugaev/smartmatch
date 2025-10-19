# 🤖 Руководство по AI анализу кандидатов для HR

## 📋 Обзор системы

Система AI анализа кандидатов позволяет HR-специалистам автоматически анализировать всех откликов на вакансию с помощью искусственного интеллекта. HR может нажать одну кнопку и получить:

- **Рейтинг кандидатов** - AI оценивает каждого кандидата по шкале 1-10
- **Анализ соответствия** - оценка соответствия требованиям вакансии (0-100%)
- **Сильные и слабые стороны** - детальный анализ каждого кандидата
- **Рекомендации** - советы для HR по каждому кандидату
- **Топ-кандидаты** - автоматически отсортированный список лучших кандидатов

## 🚀 Основные возможности

### ✨ Автоматический анализ
- **Одна кнопка** - HR нажимает кнопку и получает полный анализ всех откликов
- **Быстрая обработка** - анализ десятков кандидатов за секунды
- **Умная оптимизация** - система не отправляет большие файлы в AI, только ключевую информацию

### 🎯 Критерии оценки AI
- **Соответствие навыков** - насколько навыки кандидата соответствуют требованиям
- **Релевантный опыт** - оценка опыта работы по профилю
- **Образование** - соответствие образовательных требований
- **Качество заявки** - анализ сопроводительного письма и резюме
- **Общее впечатление** - комплексная оценка кандидата

### 📊 Результаты анализа
- **Overall Score** - общая оценка кандидата (1-10)
- **Match Score** - соответствие вакансии (0-100%)
- **Fit Level** - уровень соответствия (low/medium/high)
- **Strengths** - сильные стороны кандидата
- **Weaknesses** - области для улучшения
- **Recommendations** - рекомендации для HR

## 🔧 API Эндпоинты

### 1. Анализ всех кандидатов на вакансию

#### Эндпоинт
```http
POST /hr-ai/analyze-job-candidates
Authorization: Bearer <hr_token>
Content-Type: application/json
```

#### Параметры запроса
```json
{
  "jobId": "job_123456789"
}
```

#### Пример запроса

**cURL:**
```bash
curl -X POST http://localhost:3000/hr-ai/analyze-job-candidates \
  -H "Authorization: Bearer <hr_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "job_123456789"
  }'
```

**JavaScript:**
```javascript
async function analyzeJobCandidates(jobId, hrToken) {
  const response = await fetch('/hr-ai/analyze-job-candidates', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hrToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ jobId })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

// Использование
const analysis = await analyzeJobCandidates('job_123456789', hrToken);
console.log('Топ кандидаты:', analysis.data.topCandidates);
```

#### Ответ при успехе
```json
{
  "success": true,
  "data": {
    "jobId": "job_123456789",
    "totalApplications": 25,
    "topCandidates": [
      {
        "candidateId": "candidate_123",
        "applicationId": "application_456",
        "overallScore": 9,
        "matchScore": 95,
        "fitLevel": "high",
        "strengths": [
          "5+ лет опыта в React",
          "Опыт работы в крупных проектах",
          "Знание TypeScript и современных инструментов"
        ],
        "weaknesses": [
          "Отсутствует опыт с GraphQL",
          "Нет опыта работы в команде более 10 человек"
        ],
        "recommendations": [
          "Приоритетный кандидат для собеседования",
          "Рекомендуется техническое интервью",
          "Проверить опыт работы в команде"
        ],
        "aiNotes": "Отличный кандидат с сильным техническим бэкграундом. Высокое соответствие требованиям вакансии."
      },
      {
        "candidateId": "candidate_789",
        "applicationId": "application_101",
        "overallScore": 7,
        "matchScore": 78,
        "fitLevel": "medium",
        "strengths": [
          "Хорошие базовые навыки React",
          "Мотивация к обучению",
          "Опыт работы в стартапе"
        ],
        "weaknesses": [
          "Недостаточно опыта с Redux",
          "Отсутствует опыт с тестированием"
        ],
        "recommendations": [
          "Рассмотреть для junior позиции",
          "Провести техническое интервью",
          "Оценить потенциал роста"
        ],
        "aiNotes": "Перспективный кандидат с потенциалом роста. Требуется дополнительное обучение."
      }
    ],
    "analysisSummary": "Проанализировано 25 кандидатов. Найдено 3 отличных кандидата с высоким соответствием требованиям. Рекомендуется провести собеседования с топ-3 кандидатами.",
    "processingTime": 2500
  },
  "message": "Проанализировано 25 кандидатов за 2500мс"
}
```

### 2. Получение результатов анализа

#### Эндпоинт
```http
GET /hr-ai/job/:jobId/analysis
Authorization: Bearer <hr_token>
```

#### Пример запроса
```bash
curl -X GET http://localhost:3000/hr-ai/job/job_123456789/analysis \
  -H "Authorization: Bearer <hr_token>"
```

### 3. Проверка доступности AI сервиса

#### Эндпоинт
```http
GET /hr-ai/health
Authorization: Bearer <hr_token>
```

#### Пример запроса
```bash
curl -X GET http://localhost:3000/hr-ai/health \
  -H "Authorization: Bearer <hr_token>"
```

## 🎯 Практические сценарии использования

### Сценарий 1: Ежедневный анализ новых откликов

```javascript
// 1. Получить список вакансий с новыми откликами
const jobsWithApplications = await getJobsWithApplications(hrId);

// 2. Запустить AI анализ для каждой вакансии
for (const job of jobsWithApplications) {
  console.log(`Анализируем отклики на вакансию: ${job.title}`);
  
  const analysis = await analyzeJobCandidates(job.id, hrToken);
  
  console.log(`Найдено ${analysis.data.totalApplications} откликов`);
  console.log(`Топ кандидат: ${analysis.data.topCandidates[0]?.overallScore}/10`);
  
  // 3. Автоматически обновить статусы лучших кандидатов
  if (analysis.data.topCandidates.length > 0) {
    const topCandidate = analysis.data.topCandidates[0];
    if (topCandidate.overallScore >= 8) {
      await updateApplicationStatus(
        topCandidate.applicationId, 
        'ACCEPTED', 
        `AI рекомендует: ${topCandidate.aiNotes}`
      );
    }
  }
}
```

### Сценарий 2: Массовый анализ всех вакансий

```javascript
async function analyzeAllJobs(hrId, hrToken) {
  const jobs = await getMyJobs(hrId);
  const results = [];
  
  for (const job of jobs) {
    try {
      console.log(`Анализируем вакансию: ${job.title}`);
      
      const analysis = await analyzeJobCandidates(job.id, hrToken);
      
      results.push({
        jobId: job.id,
        jobTitle: job.title,
        totalCandidates: analysis.data.totalApplications,
        topScore: analysis.data.topCandidates[0]?.overallScore || 0,
        analysisSummary: analysis.data.analysisSummary
      });
      
      // Небольшая пауза между запросами
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Ошибка анализа вакансии ${job.title}:`, error.message);
    }
  }
  
  return results;
}

// Использование
const allAnalyses = await analyzeAllJobs(hrId, hrToken);
console.log('Результаты анализа всех вакансий:', allAnalyses);
```

### Сценарий 3: Фильтрация и сортировка результатов

```javascript
async function getTopCandidatesForJob(jobId, hrToken, minScore = 7) {
  const analysis = await analyzeJobCandidates(jobId, hrToken);
  
  // Фильтруем только высоко оцененных кандидатов
  const topCandidates = analysis.data.topCandidates.filter(
    candidate => candidate.overallScore >= minScore
  );
  
  // Сортируем по общему баллу
  topCandidates.sort((a, b) => b.overallScore - a.overallScore);
  
  return {
    jobId,
    totalAnalyzed: analysis.data.totalApplications,
    topCandidates,
    summary: analysis.data.analysisSummary
  };
}

// Использование
const topCandidates = await getTopCandidatesForJob('job_123', hrToken, 8);
console.log(`Найдено ${topCandidates.topCandidates.length} отличных кандидатов`);
```

## 🔍 Детали работы AI анализа

### Оптимизация данных
Система автоматически оптимизирует данные перед отправкой в AI:

- **Резюме** - только краткое описание (до 300 символов)
- **Опыт работы** - ключевая информация без лишних деталей
- **Навыки** - только названия и уровни
- **Образование** - основная информация
- **Сопроводительное письмо** - до 500 символов

### Критерии оценки AI

#### Overall Score (1-10)
- **9-10** - Отличный кандидат, приоритет для собеседования
- **7-8** - Хороший кандидат, рекомендуется собеседование
- **5-6** - Средний кандидат, рассмотреть при недостатке вариантов
- **1-4** - Слабый кандидат, не рекомендуется

#### Match Score (0-100%)
- **90-100%** - Полное соответствие требованиям
- **70-89%** - Хорошее соответствие с небольшими пробелами
- **50-69%** - Частичное соответствие, требуется обучение
- **0-49%** - Низкое соответствие требованиям

#### Fit Level
- **High** - Высокое соответствие, приоритетный кандидат
- **Medium** - Среднее соответствие, подходит с условиями
- **Low** - Низкое соответствие, не рекомендуется

## 📊 Аналитика и отчетность

### Статистика по анализу
```javascript
async function getAnalysisStats(hrId, hrToken) {
  const jobs = await getMyJobs(hrId);
  const stats = {
    totalJobs: jobs.length,
    analyzedJobs: 0,
    totalCandidates: 0,
    highScoreCandidates: 0,
    averageScore: 0
  };
  
  for (const job of jobs) {
    try {
      const analysis = await analyzeJobCandidates(job.id, hrToken);
      stats.analyzedJobs++;
      stats.totalCandidates += analysis.data.totalApplications;
      
      const highScore = analysis.data.topCandidates.filter(
        c => c.overallScore >= 8
      ).length;
      stats.highScoreCandidates += highScore;
      
    } catch (error) {
      console.error(`Ошибка анализа ${job.title}:`, error.message);
    }
  }
  
  stats.averageScore = stats.totalCandidates > 0 
    ? stats.highScoreCandidates / stats.totalCandidates 
    : 0;
  
  return stats;
}
```

### Экспорт результатов
```javascript
async function exportAnalysisResults(jobId, hrToken) {
  const analysis = await analyzeJobCandidates(jobId, hrToken);
  
  const csvData = analysis.data.topCandidates.map(candidate => ({
    'Кандидат': candidate.candidateId,
    'Общий балл': candidate.overallScore,
    'Соответствие %': candidate.matchScore,
    'Уровень': candidate.fitLevel,
    'Сильные стороны': candidate.strengths.join('; '),
    'Слабые стороны': candidate.weaknesses.join('; '),
    'Рекомендации': candidate.recommendations.join('; '),
    'Комментарии AI': candidate.aiNotes
  }));
  
  return csvData;
}
```

## 🛡️ Безопасность и ограничения

### Права доступа
- **HR** - может анализировать только свои вакансии
- **ADMIN** - может анализировать любые вакансии
- **Кандидаты** - не имеют доступа к AI анализу

### Ограничения
- Максимум 100 кандидатов за один анализ
- Таймаут анализа: 30 секунд
- Лимит запросов: 10 анализов в час на HR

### Приватность данных
- AI не сохраняет персональные данные кандидатов
- Анализ выполняется в реальном времени
- Результаты не передаются третьим лицам

## 🚨 Обработка ошибок

### Типичные ошибки

```javascript
// 403 - Нет прав на анализ вакансии
if (error.status === 403) {
  console.error('У вас нет прав для анализа этой вакансии');
}

// 404 - Вакансия не найдена
if (error.status === 404) {
  console.error('Вакансия не найдена или у вас нет к ней доступа');
}

// 500 - Ошибка AI сервиса
if (error.status === 500) {
  console.error('AI сервис временно недоступен. Попробуйте позже.');
}
```

### Обработка ошибок в коде
```javascript
async function safeAnalyzeJobCandidates(jobId, hrToken) {
  try {
    return await analyzeJobCandidates(jobId, hrToken);
  } catch (error) {
    if (error.status === 403) {
      console.error('Нет прав для анализа вакансии');
    } else if (error.status === 404) {
      console.error('Вакансия не найдена');
    } else if (error.status === 500) {
      console.error('AI сервис недоступен');
    } else {
      console.error('Неожиданная ошибка:', error.message);
    }
    throw error;
  }
}
```

## 📝 Лучшие практики

### 1. Регулярный анализ
- Запускайте анализ при поступлении новых откликов
- Анализируйте вакансии с большим количеством откликов
- Используйте результаты для приоритизации кандидатов

### 2. Интерпретация результатов
- Не полагайтесь только на AI оценки
- Используйте AI как инструмент для первичной фильтрации
- Всегда проводите личное собеседование

### 3. Оптимизация процесса
- Анализируйте вакансии пакетами
- Сохраняйте результаты для последующего анализа
- Используйте фильтры для фокуса на лучших кандидатах

### 4. Непрерывное улучшение
- Собирайте обратную связь о качестве анализа
- Корректируйте критерии оценки при необходимости
- Обновляйте промпты для улучшения точности

## 🔧 Интеграция с другими системами

### CRM интеграция
```javascript
// Отправка результатов анализа в CRM
async function sendAnalysisToCRM(jobId, analysis) {
  const crmData = {
    jobId,
    totalCandidates: analysis.data.totalApplications,
    topCandidates: analysis.data.topCandidates.slice(0, 5),
    analysisDate: new Date(),
    hrId: analysis.hrId
  };
  
  await sendToCRM(crmData);
}
```

### Email уведомления
```javascript
// Уведомление HR о результатах анализа
async function notifyHrAboutAnalysis(hrEmail, analysis) {
  const emailContent = `
Результаты AI анализа вакансии:
- Проанализировано кандидатов: ${analysis.data.totalApplications}
- Топ кандидат: ${analysis.data.topCandidates[0]?.overallScore}/10
- Рекомендации: ${analysis.data.analysisSummary}
  `;
  
  await sendEmail({
    to: hrEmail,
    subject: 'Результаты AI анализа кандидатов',
    body: emailContent
  });
}
```

## 📚 Дополнительные ресурсы

- [HR Application Processing Guide](./HR_APPLICATION_PROCESSING_GUIDE.md) - Обработка заявок
- [AI Agent Guide](./AI_AGENT_GUIDE.md) - Общие возможности AI
- [API Guide](./API_GUIDE.md) - Полное руководство по API
- [Admin Dashboard](./ADMIN_DASHBOARD_API.md) - Административная панель

---

**Примечание:** AI анализ является вспомогательным инструментом и не заменяет личную оценку HR-специалиста. Всегда проводите собеседования с кандидатами перед принятием решений.
