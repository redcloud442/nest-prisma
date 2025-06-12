import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  REDIS_WEBSOCKET_URL: z.string().url(),
  JWT_SECRET: z.string(),
  DATABASE_URL: z.string().url().optional(),
});

const env = envSchema.parse(process.env);

export const config = {
  redis: {
    url: env.REDIS_WEBSOCKET_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
  },
};
