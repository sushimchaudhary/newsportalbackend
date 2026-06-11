import * as z from "zod";

export const CreateNewsSchema = z.object({
  title: z.string().min(5).max(200),
  category: z.string().min(1, "Category is required"),
  subCategory: z.preprocess(
    (val) => (val === "" ? undefined : val), 
    z.string().optional().nullable()
  ),
  type: z.array(z.string()).optional(),
  tags: z.preprocess((val) => {
    if (typeof val === "string") return JSON.parse(val); // Multer le string pathayo vane
    return val;
  }, z.array(z.string())),
  
  content: z.string().optional(),
  is_published: z.enum(['Draft', 'Pending', 'Published']).default('Draft'),
});