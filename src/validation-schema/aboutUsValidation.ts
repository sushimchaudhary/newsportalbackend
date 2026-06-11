import * as z from "zod";

export const AboutValidationSchema = z.object({
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(35000, { message: "Description is too long" }),
  
  image: z.any().optional(),
});

export type AboutFormValues = z.infer<typeof AboutValidationSchema>;