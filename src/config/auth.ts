import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const authConfig = {
  pages: {
    signIn: "/auth/signin" as const,
    signUp: "/auth/signup" as const,
  },
  secret: process.env.JWT_SECRET || "your-secret-key",
  cookieName: "session",
  cookieMaxAge: 60 * 60 * 24, // 1 day
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  } as Partial<ResponseCookie>,
  jwt: {
    expiresIn: "1d",
    algorithm: "HS256" as const,
  },
  publicPaths: [
    "/",
    "/auth/signin",
    "/auth/signup",
    "/_next",
    "/api/auth",
    "/static",
    "/favicon.ico",
    "/public",
  ] as const,
  // API routes that don't require authentication
  publicApiRoutes: ["/api/auth"] as const,
} as const;

// Type-safe config
export type AuthConfig = typeof authConfig;

// Helper types
export type AuthPages = typeof authConfig.pages;
export type PublicPaths = (typeof authConfig.publicPaths)[number];
export type PublicApiRoutes = (typeof authConfig.publicApiRoutes)[number];
