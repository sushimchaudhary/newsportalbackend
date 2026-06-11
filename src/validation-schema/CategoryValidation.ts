import * as z from "zod";

export const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Category name must be at least 2 characters" })
    .max(50, { message: "Category name is too long" })
    .trim(),

  description: z
    .string()
    .max(500, { message: "Description cannot exceed 500 characters" })
    .optional(),

    parentId: z.string().optional().nullable(),

    is_active: z.preprocess((val) => val === "active" || val === true, z.boolean()).default(true),

  image: z.any().optional(),
});

export type CategoryFormValues = z.infer<typeof CreateCategorySchema>;