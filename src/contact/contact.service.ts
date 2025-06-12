import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.service";
import { CreateContactFormDto } from "./dto/dto";

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService
  ) {}

  async getAllContact(userId: string, take: number, skip: number) {
    const cacheKey = `contact:${userId}`;

    const cachedData = await this.redisService.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const contact = await this.prisma.contact_table.findMany({
      where: {
        contact_user_id: userId,
      },
      skip,
      take,
      orderBy: {
        contact_created_at: "desc",
      },
    });

    const total = await this.prisma.contact_table.count({
      where: {
        contact_user_id: userId,
      },
    });

    const returnData = {
      contact,
      total,
    };

    await this.redisService.set(cacheKey, JSON.stringify(returnData), {
      ex: 60 * 60 * 24,
    });

    return returnData;
  }

  async createContact(params: CreateContactFormDto, userId: string) {
    const { name, fbLink, category } = params;

    const cacheKey = `contact:${userId}`;

    const contact = await this.prisma.contact_table.create({
      data: {
        contact_name: name,
        contact_fb_link: fbLink,
        contact_category: category,
        contact_user_id: userId,
      },
    });

    await this.redisService.del(cacheKey);

    return contact;
  }

  async deleteContact(id: string, userId: string) {
    const cacheKey = `contact:${userId}`;

    const contact = await this.prisma.contact_table.delete({
      where: {
        contact_id: id,
        contact_user_id: userId,
      },
    });

    await this.redisService.del(cacheKey);

    return contact;
  }
}
