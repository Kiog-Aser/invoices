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
    databaseName: process.env.MONGODB_URI?.split('/').pop()?.split('?')[0],
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
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.uid as string;
        session.user.image = token.picture as string;
        session.user.plan = token.plan as string;
        session.user.customerId = token.customerId as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        token.uid = user.id;
        token.plan = user.plan;
        token.customerId = user.customerId;
        token.isAdmin = user.isAdmin;
      }
      
      // if we update the session, we want to also update the token
      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.email = session.user.email;
        token.picture = session.user.image;
        token.plan = session.user.plan;
        token.customerId = session.user.customerId;
        token.isAdmin = session.user.isAdmin;
      }
      
      return token;
    },
    redirect({ url, baseUrl }) {
      // Always redirect to /dashboard after sign in
      if (url.startsWith(baseUrl)) {
        return "/dashboard";
      } else if (url.startsWith("/")) {
        return "/dashboard";
      }
      return "/dashboard";
    }
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/",
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