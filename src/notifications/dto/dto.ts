import { z } from "zod";

export const SendNotificationDto = z.object({
  userId: z.string(),
  message: z.string(),
  title: z.string(),
  data: z.record(z.any()),
});

export type SendNotificationDto = z.infer<typeof SendNotificationDto>;

export const SendNotificationFormDto = z.object({
  mode: z.enum(["sendToAll", "sendToUser"]),
  userIds: z.string().array().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.array(z.string().optional()),
  file: z.array(z.instanceof(File).optional()).optional().nullable(),
});

export type SendNotificationFormDto = z.infer<typeof SendNotificationFormDto>;
