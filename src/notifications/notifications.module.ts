import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthModule } from "src/auth/auth.module";
import { SupabaseStrategy } from "src/auth/strategies/supabase.strategy";
import { ContextService } from "src/common/context/context.service";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.service";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1h" },
      }),
    }),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    PrismaService,
    RedisService,
    JwtService,
    ContextService,
    SupabaseStrategy,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
