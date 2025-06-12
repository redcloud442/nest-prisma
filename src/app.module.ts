import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { ContactModule } from "./contact/contact.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { PrismaService } from "./prisma/prisma.service";
import { RedisService } from "./redis/redis.service";

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    NotificationsModule,
    ContactModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, RedisService],
})
export class AppModule {}
