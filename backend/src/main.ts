import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';

async function bootstrap() {
  const requiredEnv = [
    'FEISHU_APP_ID',
    'FEISHU_APP_SECRET',
    'FEISHU_REDIRECT_URI',
    'BITABLE_APP_TOKEN',
    'BITABLE_TABLE_EMPLOYEES',
    'BITABLE_TABLE_OBJECTIVES',
    'BITABLE_TABLE_COMPLETIONS',
    'JWT_SECRET',
    'FRONTEND_URL',
  ];
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`缺少必要环境变量: ${missing.join(', ')}`);
  }

  const app = await NestFactory.create(AppModule);

  // 请求日志
  const requestLogger = new RequestLoggerMiddleware();
  app.use(requestLogger.use.bind(requestLogger));

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 全局响应与异常处理
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS配置
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // API前缀
  app.setGlobalPrefix('api');

  // Swagger文档（非生产环境）
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('绩效考核系统 API')
      .setDescription('飞书绩效考核系统后端接口文档')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 服务器已启动: http://localhost:${port}`);
  console.log(`📚 API地址: http://localhost:${port}/api`);
}

bootstrap();
