import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS 配置
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger API 文档配置
  const config = new DocumentBuilder()
    .setTitle('Dify Chat Backend API')
    .setDescription('Dify Chat 后端服务 API 文档')
    .setVersion('0.6.3')
    .addTag('auth')
    .addTag('apps')
    .addTag('users')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Backend server is running on: http://localhost:${port}`);
  console.log(`📚 API documentation available at: http://localhost:${port}/api`);
}

bootstrap();