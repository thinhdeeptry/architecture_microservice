import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors();

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`API Gateway is running o1n: ${await app.getUrl()}`);
  
}
bootstrap();
