"use server";

import { redirect } from "next/navigation";

import { z } from "zod";

import { signIn, signUp } from "@/lib/auth";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function registerUser(formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  };

  const callbackUrl = (formData.get("callbackUrl") as string) || "/";

  try {
    const data = registerSchema.parse(rawData);
    const user = await signUp(data.email, data.password, data.name);

    if (!user) {
      return {
        error: "A user with this email already exists",
        fields: { email: "A user with this email already exists" },
      };
    }

    // Sign in the user after successful registration
    await signIn(data.email, data.password);

    // Redirect after successful registration and sign in
    return redirect(callbackUrl);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields = Object.fromEntries(
        error.errors.map((err) => [err.path[0], err.message])
      );
      return { error: "Invalid input", fields };
    }
    console.error("Registration error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function loginUser(formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const callbackUrl = (formData.get("callbackUrl") as string) || "/";

  try {
    const data = loginSchema.parse(rawData);
    const user = await signIn(data.email, data.password);

    if (!user) {
      return {
        error: "Invalid email or password",
        fields: { email: "Invalid email or password" },
      };
    }

    // Redirect after successful login
    return redirect(callbackUrl);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields = Object.fromEntries(
        error.errors.map((err) => [err.path[0], err.message])
      );
      return { error: "Invalid input", fields };
    }
    console.error("Login error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export type AuthError = {
  error: string;
  fields?: Record<string, string>;
};
