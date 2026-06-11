import * as z from "zod";

const roles = ["SuperAdmin", "Editor", "Journalist", "Reader"] as const;

export const UserValidationSchema = z.object({
  username: z.string().min(3, "Username is required"),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  contact: z.string().min(7, "Contact number is required"),
  address: z.string().optional(),
  role: z.enum(roles, {
    message: "Please select a valid role",
  }),
  image: z.any().optional(),
});



// Login Schema
export const LoginSchema = z.object({
  // 'username' le email wa username dubai handle garna sakcha backend logic anusaar
  username: z
    .string()
    .min(3, "Username or Email is required")
    .trim(),
    
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password is too long"),
    
  // Optional: Remember me checkbox ko lagi
  rememberMe: z.boolean().optional().default(false),
});

// Type export
export type LoginFormValues = z.infer<typeof LoginSchema>;

export type UserFormValues = z.infer<typeof UserValidationSchema>;