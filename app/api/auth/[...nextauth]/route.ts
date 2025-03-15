import NextAuth, { DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import type { JWT } from "next-auth/jwt";
import clientPromise from "@/libs/mongo";
import User from "@/models/User";

// Define the JWT callback parameters type
type JWTCallbackParams = {
  token: JWT;
  user?: any;
  trigger?: "signIn" | "signUp" | "update";
  session?: any;
};

// Force dynamic to ensure this is not cached
export const dynamic = 'force-dynamic';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          plan: profile.plan || "",
        };
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          plan: profile.plan || "",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: MongoDBAdapter(clientPromise, {
    collections: {
      Users: "users",
      Accounts: "accounts",
      Sessions: "sessions",
      VerificationTokens: "verification_tokens",
    },
  }),
  callbacks: {
    async jwt({ token, user, trigger }: JWTCallbackParams) {
      if (user) {
        token.id = user.id;
        token.plan = user.plan || "";
      }
      
      // Only update from db when absolutely necessary to avoid timeouts
      if (trigger === "update") {
        // The token update is handled by the session update data
        if (token?.email) {
          try {
            // Explicitly type the returned document to fix the TypeScript error
            interface UserDoc {
              plan?: string;
            }
            
            // Limit fields returned to improve performance
            const dbUser = await User.findOne({ email: token.email }, 'plan').lean() as UserDoc | null;
            if (dbUser) {
              token.plan = dbUser.plan || "";
            }
          } catch (error) {
            console.error("Error fetching user in JWT callback:", error);
          }
        }
      }
      
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.plan = token.plan || "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };