import z from "zod";

export const CreateContactFormDto = z.object({
  name: z.string().min(1, "Name is required"),
  fbLink: z
    .string()
    .url("Must be a valid URL")
    .includes("facebook.com", { message: "Must be a Facebook link" }),
  category: z.string().optional(),
});

export type CreateContactFormDto = z.infer<typeof CreateContactFormDto>;
