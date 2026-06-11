import * as z from "zod";

export const CreateOrganizationSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Organization name must be at least 3 characters" })
    .max(100, { message: "Name is too long" }),
    
  email: z
    .string()
    .email({ message: "Please enter a valid official email address" }),
    
  address: z
    .string()
    .min(2, { message: "Address is too short" })
    .max(200, { message: "Address is too long" }),
    
    contact_no: z.preprocess((val) => {
      if (typeof val === 'string') return [val];
      return val;
    }, z.array(
      z.string()
        .min(7, { message: "Too short" })
        .max(10, { message: "Too long" })
        .regex(/^\d+$/, { message: "Only digits allowed" })
    ).min(1, { message: "At least one contact number is required" })),
 
  logo: z.any().optional(),

  fb_link: z.string().optional(),
  insta_link: z.string().optional(),
  linkedin_link: z.string().optional(),
  x_link: z.string().optional(),
  google_map: z.string().optional(),
});

export type OrganizationFormValues = z.infer<typeof CreateOrganizationSchema>;