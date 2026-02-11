import z from "zod";

export const PasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d])(?=.*[\W_-]).{8,25}$/;

export const LoginSchema = z.object({
    username: z.string().min(3, "Username must be atleast 3 charater long").nonempty("username is required"),
    password: z.string().min(8, "Password is to short")
})


export const RegisterSchema = z.object({
    name: z.string().min(2,"Name must be atleast 2 character long").max(50).nonempty("Name is required"),
    email: z.email().nonempty("Email is required"),
    username:z.string().min(5, "Username must be of atleast 5 character long").nonempty("Username is required"),
    password: z.string().regex(PasswordRegex, "Password must contain atleast 8 characters ").max(25).nonempty("Password is required"),
    confirmPassword: z.string().min(8, "Confirm-Password must match password data").max(25).nonempty("Confirm password is required"),
    role: z.string().regex(/^(customer | seller)$/,"Role can be either `customer` or `seller`").default('customer')
    //role: z.enum(["customer", "seller"], "Role can be either `customer` or `seller`").default("customer")
}).refine((data)=> data.password === data.confirmPassword, {
    message: "Password and confirm Password does not match",
    path : ["confirmPassword"],
})