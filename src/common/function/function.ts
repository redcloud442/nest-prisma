// custom-zod.pipe.ts
import { Redis } from "ioredis";
import { ZodSchema } from "zod";
import { ContextService } from "../context/context.service";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";

export function CustomZodPipe(schema: ZodSchema<any>) {
  const contextService = new ContextService(); // ⚠️ You should inject this properly
  const pipe = new ZodValidationPipe(contextService);
  pipe.setSchema(schema);
  return pipe;
}

export const invalidateMultipleCache = async (
  redis: Redis,
  baseKeys: string[]
) => {
  const pipeline = redis.multi();

  baseKeys.forEach((baseKey) => {
    pipeline.del(baseKey);
  });

  await pipeline.exec();
};
