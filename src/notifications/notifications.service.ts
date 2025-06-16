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

    const readBroadcasts = await this.prisma.user_broadcast_read_table.findMany(
      {
        where: { user_id: userId },
        select: { broadcast_notification_id: true },
      }
    );

    const readBroadcastIds = new Set(
      readBroadcasts.map((b) => b.broadcast_notification_id)
    );

    const notification = await this.prisma.notification_table.findMany({
      where: {
        OR: [
          { notification_user_id: userId },
          { notification_is_broadcast: true },
        ],
      },
      take,
      skip: offset,
      orderBy: {
        notification_created_at: "desc",
      },
    });

    const notification_count = await this.prisma.notification_table.count({
      where: {
        OR: [
          { notification_user_id: userId },
          { notification_is_broadcast: true },
        ],
      },
    });

    if (
      notification.some(
        (item) =>
          item.notification_user_id === userId &&
          item.notification_is_read === false
      )
    ) {
      await this.prisma.notification_table.updateMany({
        where: {
          notification_user_id: userId,
          notification_is_read: false,
        },
        data: {
          notification_is_read: true,
        },
      });
    }

    const newReadBroadcasts = notification
      .filter(
        (item) =>
          item.notification_is_broadcast &&
          !readBroadcastIds.has(item.notification_id)
      )
      .map((item) => ({
        user_id: userId,
        broadcast_notification_id: item.notification_id,
      }));

    if (newReadBroadcasts.length > 0) {
      await this.prisma.user_broadcast_read_table.createMany({
        data: newReadBroadcasts,
      });
    }

    return {
      notification,
      notification_count,
    };
  }

  async getNotificationCount(userId: string) {
    const personalUnreadCount = await this.prisma.notification_table.count({
      where: {
        notification_user_id: userId,
        notification_is_read: false,
      },
    });

    const readBroadcasts = await this.prisma.user_broadcast_read_table.findMany(
      {
        where: { user_id: userId },
        select: { broadcast_notification_id: true },
      }
    );

    const readBroadcastIds = readBroadcasts.map(
      (b) => b.broadcast_notification_id
    );

    const broadcastUnreadCount = await this.prisma.notification_table.count({
      where: {
        notification_is_broadcast: true,
        notification_id: {
          notIn: readBroadcastIds,
        },
      },
    });

    return {
      notification_count: personalUnreadCount + broadcastUnreadCount,
    };
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

    return {
      success: true,
      message: "Notification sent successfully",
    };
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
