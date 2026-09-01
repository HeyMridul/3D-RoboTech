import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validation/schemas";
import { ApiError, checkRateLimit } from "@/lib/api-utils";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: UserRole;
    };
  }

  interface User {
    role: UserRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

/** Cost-matched bcrypt hash used to equalise timing on unknown accounts. */
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8.5vC0Xh0Uq1kZ8Wl8h9y0Q1kZ8Wl8";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        // Throttle credential stuffing per source address.
        const headerList = await headers();
        const ip =
          headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          headerList.get("x-real-ip") ||
          "unknown";
        if (!checkRateLimit(`login:${ip}`, 5, 5 * 60_000).ok) {
          throw new Error("Too many sign-in attempts. Try again shortly.");
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email, deletedAt: null },
        });

        // Hash a throwaway value when the user is unknown so the response
        // time does not reveal whether the address exists.
        if (!user) {
          await bcrypt.compare(parsed.data.password, DUMMY_HASH);
          return null;
        }

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
});

/**
 * Gate for authenticated server work. Throws ApiError so route handlers can
 * hand it straight to handleApiError and get a correct 401/403.
 */
export async function requireAuth(roles?: UserRole[]) {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError(401, "Authentication required.");
  }
  if (roles && !roles.includes(session.user.role)) {
    throw new ApiError(403, "You do not have permission to perform this action.");
  }
  return session;
}

/** Roles allowed to change content. VIEWER is read-only by design. */
export const CONTENT_EDITORS: UserRole[] = ["ADMIN", "EDITOR"];
/** Destructive and configuration actions are admin-only. */
export const ADMINS_ONLY: UserRole[] = ["ADMIN"];
