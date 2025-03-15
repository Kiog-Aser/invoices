import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import type { JWT } from "next-auth/jwt";
import clientPromise from "@/libs/mongo";
import config from "@/config";

// Get the domain from NEXTAUTH_URL
const domain = process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).hostname : undefined;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: 'test',
    collections: {
      Users: 'users',
      Accounts: 'accounts',
      Sessions: 'sessions',
      VerificationTokens: 'verification_tokens',
    }
  }),
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    session({ session, token }) {
      if (session?.user && token.sub) {
        session.user.id = token.sub;
        session.user.plan = token.plan as string || '';
        session.user.customerId = token.customerId as string || '';
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.plan = user.plan;
        token.customerId = user.customerId;
      }
      
      if (trigger === "update" && session?.user) {
        token.plan = session.user.plan;
        token.customerId = session.user.customerId;
      }
      
      return token;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: domain && domain !== 'localhost' ? '.notifast.fun' : undefined
      }
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: domain && domain !== 'localhost' ? '.notifast.fun' : undefined
      }
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    }
  },
  useSecureCookies: true,
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);