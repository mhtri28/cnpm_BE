import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'dotenv';
import { SqlExceptionsFilter } from './filters/sql-exceptions.filter';

// Load .env file
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Thêm global prefix cho API v1
  app.setGlobalPrefix('api/v1');

  // Thêm validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Thêm global filter cho SQL exceptions
  app.useGlobalFilters(new SqlExceptionsFilter());

  // Cấu hình CORS
  app.enableCors();

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Quản lý Quán Cafe API')
    .setDescription('Tài liệu API cho hệ thống quản lý quán cafe')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('employees', 'Quản lý nhân viên')
    .addTag('suppliers', 'Quản lý nhà cung cấp')
    .addTag('ingredients', 'Quản lý nguyên liệu')
    .addTag('recipes', 'Quản lý công thức')
    .addTag('stock-imports', 'Quản lý nhập kho')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(
    `Swagger documentation is available at: ${await app.getUrl()}/api/docs`,
  );
}
bootstrap();
