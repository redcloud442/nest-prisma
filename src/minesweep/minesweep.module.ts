import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.service";
import { MinesweepController } from "./minesweep.controller";
import { MinesweepService } from "./minesweep.service";

@Module({
  controllers: [MinesweepController],
  providers: [MinesweepService, PrismaService, RedisService],
})
export class MinesweepModule {}
