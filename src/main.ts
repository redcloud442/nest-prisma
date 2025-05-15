import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ErrorMiddleware } from "./common/middleware/error.middleware";
import { LoggerMiddleware } from "./common/middleware/logger.middleware";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  });

  app.use(new LoggerMiddleware().use);
  app.use(new ErrorMiddleware().use);

  app.setGlobalPrefix("api");

  const config = new DocumentBuilder()
    .setTitle("My API")
    .setDescription("The API description")
    .setVersion("1.0")
    .setBasePath("api")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(8000);
}
bootstrap();
