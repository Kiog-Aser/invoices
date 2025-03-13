import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import config from "@/config";

// Used for storing users, sessions, etc. in MongoDB
const clientPromise = process.env.MONGODB_URI 
  ? MongoClient.connect(process.env.MONGODB_URI)
  : null;

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
  // New users will be saved in Database (MongoDB Atlas)
  adapter: clientPromise ? MongoDBAdapter(clientPromise) : undefined,
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
  session: {
    strategy: "jwt",
  },
  theme: {
    brandColor: config.colors.main,
    logo: `https://${config.domainName}/logoAndName.png`,
  },
};

export default NextAuth(authOptions);
