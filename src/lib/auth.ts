"use server";

import { cookies } from "next/headers";

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { nanoid } from "nanoid";

import { authConfig } from "@/config/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

const key = new TextEncoder().encode(authConfig.secret);

export async function signIn(email: string, password: string) {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (!user || !user.hashedPassword) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.hashedPassword);

  if (!isValid) {
    return null;
  }

  // Create session
  const token = await new SignJWT({ id: user.id })
    .setProtectedHeader({ alg: authConfig.jwt.algorithm })
    .setExpirationTime(authConfig.jwt.expiresIn)
    .sign(key);

  // Save session to cookie
  const cookieStore = await cookies();
  cookieStore.set({
    name: authConfig.cookieName,
    value: token,
    ...authConfig.cookieOptions,
    maxAge: authConfig.cookieMaxAge,
  });

  return user;
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete({
    name: authConfig.cookieName,
    ...authConfig.cookieOptions,
  });
}

export async function auth() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(authConfig.cookieName)?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(sessionToken, key);
    const userId = payload.id as string;

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });

    if (!user) {
      cookieStore.delete({
        name: authConfig.cookieName,
        ...authConfig.cookieOptions,
      });
      return null;
    }

    return user;
  } catch {
    cookieStore.delete({
      name: authConfig.cookieName,
      ...authConfig.cookieOptions,
    });
    return null;
  }
}

export async function signUp(email: string, password: string, name: string) {
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (existingUser) {
    return null;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = nanoid();

  const [user] = await db
    .insert(users)
    .values({
      id,
      email,
      name,
      hashedPassword,
    })
    .returning();

  return user;
}

// Types
export interface Session {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  emailVerified: string | null;
  image: string | null;
}
