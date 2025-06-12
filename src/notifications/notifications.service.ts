import { Prisma } from ".prisma/client";
import { Injectable } from "@nestjs/common";
import { invalidateMultipleCache } from "src/common/function/function";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.service";
import { SendNotificationFormDto } from "./dto/dto";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService
  ) {}

  async getNotification(userId: string, take: number, skip: number) {
    const offset = take * skip;

    const notification = await this.prisma.notification_table.findMany({
      where: {
        OR: [
          { notification_user_id: userId },
          { notification_is_broadcast: true },
        ],
      },
      take: take,
      skip: offset,
      orderBy: {
        notification_created_at: "desc",
      },
    });

    const notification_count = await this.prisma.notification_table.count({
      where: {
        OR: [
          {
            notification_user_id: userId,
          },
          {
            notification_is_broadcast: true,
          },
        ],
      },
    });

    const returnData = {
      notification,
      notification_count,
    };

    return returnData;
  }

  async sendToUser(params: SendNotificationFormDto) {
    const notificationData: Prisma.notification_tableCreateManyInput[] = [];
    const cacheKey = [];

    for (const userId of params.userIds) {
      notificationData.push({
        notification_user_id: userId,
        notification_title: params.title,
        notification_message: params.description,
        notification_image_url: params.imageUrl,
        notification_is_broadcast: false,
      });

      cacheKey.push(`notification:${userId}`);
    }

    await invalidateMultipleCache(
      await this.redisService.getClient(),
      cacheKey
    );

    await this.prisma.notification_table.createMany({
      data: notificationData,
    });
  }

  async broadcast(params: SendNotificationFormDto) {
    const notificationData: Prisma.notification_tableCreateInput = {
      notification_user_id: "",
      notification_title: params.title,
      notification_message: params.description,
      notification_image_url: params.imageUrl,
      notification_is_broadcast: true,
    };

    await this.prisma.notification_table.create({
      data: notificationData,
    });
  }
}
