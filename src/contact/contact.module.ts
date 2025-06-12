import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "src/auth/auth.module";
import { SupabaseStrategy } from "src/auth/strategies/supabase.strategy";
import { RbacGuard } from "src/common/guard/rbac.guard";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.service";
import { ContactController } from "./contact.controller";
import { ContactService } from "./contact.service";

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [ContactController],
  providers: [
    ContactService,
    PrismaService,
    RedisService,
    JwtService,
    SupabaseStrategy,
    RbacGuard,
  ],
  exports: [ContactService],
})
export class ContactModule {}
