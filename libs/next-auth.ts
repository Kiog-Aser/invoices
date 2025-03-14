import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/libs/mongo";
import config from "@/config";

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
    databaseName: 'shipfast', // Specify your database name
    collections: {
      Users: 'users',
      Accounts: 'accounts',
      Sessions: 'sessions',
      VerificationTokens: 'verification_tokens',
    }
  }),
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours instead of 30 days to reduce database load
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
        token.plan = (user as any).plan;
        token.customerId = (user as any).customerId;
      }
      
      if (trigger === "update" && session?.user?.plan) {
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
  secret: process.env.NEXTAUTH_SECRET,
  // Lower the JWT timeout to match the session maxAge
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
