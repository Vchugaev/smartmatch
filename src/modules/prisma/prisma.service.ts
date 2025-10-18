import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private static isConnected = false;

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Настройки логирования
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    if (PrismaService.isConnected) {
      return;
    }

    try {
      await this.$connect();
      PrismaService.isConnected = true;
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (!PrismaService.isConnected) {
      return;
    }

    try {
      await this.$disconnect();
      PrismaService.isConnected = false;
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection error:', error);
    }
  }

  // Метод для проверки состояния соединения
  async isConnected(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  // Метод для безопасного выполнения запросов с обработкой ошибок соединения
  async safeExecute<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error.message?.includes('too many clients')) {
        console.warn('⚠️ Too many database connections, retrying...');
        // Небольшая задержка перед повторной попыткой
        await new Promise(resolve => setTimeout(resolve, 100));
        return await operation();
      }
      throw error;
    }
  }
}
