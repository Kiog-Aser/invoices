import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter"; // Updated package name
import clientPromise from "@/libs/mongo"; // Fixed import path
import User from "@/models/User"; // Add this import

export const authOptions = {
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
          plan: profile.plan || "", // Default to free plan if not provided
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
          plan: profile.plan || "", // Default to free plan if not provided
        };
      },
    }),
  ],
  // Use JWT strategy instead of database for sessions
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Add MongoDB adapter to store user data in the database
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Add user ID to token when first signing in
      if (user) {
        token.id = user.id;
        token.plan = user.plan || "";
      }
      
      // Fetch the latest user data from database on session update
      if (trigger === "update" || trigger === "refresh" || trigger === "session") {
        // Connect to MongoDB and get fresh user data
        try {
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.plan = dbUser.plan || "";
          }
        } catch (error) {
          console.error("Error fetching user in JWT callback:", error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // Add user ID from token to the session
      if (session.user) {
        session.user.id = token.id;
        session.user.plan = token.plan || ""; // Get plan from token
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
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };