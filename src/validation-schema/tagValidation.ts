import * as z from "zod";

export const CreateTagSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Tag name must be at least 2 characters" })
    .max(30, { message: "Tag name is too long" })
    .trim(),

  description: z
    .string()
    .max(200, { message: "Description cannot exceed 200 characters" })
    .optional(),

  is_active: z.preprocess(
    (val) => val === "active" || val === "true" || val === true, 
    z.boolean()
  ).default(true),
});

export type TagFormValues = z.infer<typeof CreateTagSchema>;