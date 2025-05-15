import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

//types

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
