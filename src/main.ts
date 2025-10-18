import { NestFactory } from '@nestjs/core';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: true,
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
  
  // Cookie parser
  app.use(cookieParser());
  
  // Увеличиваем лимиты для загрузки файлов
  app.use((req, res, next) => {
    if (req.url.includes('/storage/upload')) {
      // Увеличиваем лимит для загрузки файлов
      req.setTimeout(300000); // 5 минут
      res.setTimeout(300000); // 5 минут
    }
    next();
  });
  
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
