import { z } from "zod";

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Accepts a single string OR an array of strings (multipart sends either)
const captionsField = z
  .union([
    z.string().optional(),
    z.array(z.string().optional()),
  ])
  .optional();

// Accepts "true" | "false" string from FormData, or a real boolean
const booleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((val) => val === true || val === "true")
  .optional();

// ─── Create ──────────────────────────────────────────────────────────────────
export const CreatePhotoFeatureSchema = z.object({
  title: z
    .string({ message: "Title is required" })
    .trim()
    .min(1, "Title is required"),

  description: z.string().trim().optional(),

  isPublished: booleanFromString,

  captions: captionsField,
});

// ─── Update ──────────────────────────────────────────────────────────────────
export const UpdatePhotoFeatureSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").optional(),

  description: z.string().trim().optional(),

  isPublished: booleanFromString,

  captions: captionsField,

  // Comes as a JSON string from FormData: "[{\"id\":\"...\",\"order\":0}]"
  imageOrder: z
    .string()
    .transform((val) => {
      try {
        return JSON.parse(val);
      } catch {
        return undefined;
      }
    })
    .optional(),
});

// ─── Delete single image ──────────────────────────────────────────────────────
export const DeleteImageSchema = z.object({
  imageId: z.string({ message: "imageId is required" }).min(1),
});