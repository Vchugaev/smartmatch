import { NestFactory } from '@nestjs/core';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Отключаем автоматический body parser для multipart данных
  });
  
  // Безопасность
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));
  
  app.use(compression());
  
  // Middleware для обработки разных типов запросов
  app.use((req, res, next) => {
    // Проверяем Content-Type для multipart данных
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      // Для multipart данных не применяем JSON parser
      req.setTimeout(300000); // 5 минут
      res.setTimeout(300000); // 5 минут
      next();
    } else if (req.url.includes('/profiles/avatar/upload') || req.url.includes('/storage/upload')) {
      // Для загрузки файлов не применяем JSON parser
      req.setTimeout(300000); // 5 минут
      res.setTimeout(300000); // 5 минут
      next();
    } else {
      // Для остальных эндпоинтов применяем JSON parser
      express.json({ limit: '50mb' })(req, res, next);
    }
  });
  
  // Cookie parser
  app.use(cookieParser());
  
  
  // CORS - временно разрешаем все домены для отладки
  app.enableCors({
    origin: true, // Разрешаем все доменыизт 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });
  
  // Глобальный фильтр исключений
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Валидация
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    disableErrorMessages: false, // Всегда показываем детальные сообщения об ошибках
    exceptionFactory: (errors) => {
      const result = errors.map((error) => ({
        property: error.property,
        value: error.value,
        constraints: error.constraints,
      }));
      return new HttpException(
        {
          message: 'Validation failed',
          details: result,
        },
        HttpStatus.BAD_REQUEST,
      );
    },
  }));
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
