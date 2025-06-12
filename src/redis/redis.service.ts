import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService {
  private readonly redisClient: Redis;

  constructor() {
    this.redisClient = new Redis(process.env.REDIS_WEBSOCKET_URL!);
  }

  async publish(channel: string, message: string) {
    await this.redisClient.publish(channel, message);
  }

  async subscribe(channel: string) {
    await this.redisClient.subscribe(channel);
  }

  async unsubscribe(channel: string) {
    await this.redisClient.unsubscribe(channel);
  }

  async getClient() {
    return this.redisClient;
  }

  async get(key: string) {
    return await this.redisClient.get(key);
  }

  async set(key: string, value: string, options: { ex?: number }) {
    return await this.redisClient.set(key, value, "EX", options.ex);
  }

  async del(key: string) {
    return await this.redisClient.del(key);
  }
}
