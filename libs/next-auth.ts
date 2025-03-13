import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import connectMongoose from "@/libs/mongoose";
import config from "@/config";

// Used for storing users, sessions, etc. in MongoDB
const connectMongo = process.env.MONGODB_URI ? connectMongoose : null;

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
  ...(connectMongo && { 
    adapter: MongoDBAdapter(connectMongo, {
      databaseName: "test",
      // Ensure new users are created with a default plan
      collections: {
        Users: {
          beforeCreate(user) {
            // Set default plan for new users
            user.plan = user.plan || '';
            return user;
          }
        }
      }
    }) 
  }),

  callbacks: {
    // Include user.id and plan in session
    session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
        // Add plan from token to session
        session.user.plan = token.plan;
        session.user.customerId = token.customerId; // Make sure this line exists
      }
      return session;
    },
    // Store plan in the token
    async jwt({ token, user, account, profile, trigger, session }) {
      // Initial sign in - add plan from database user
      if (user) {
        token.plan = user.plan;
        token.customerId = user.customerId; // Make sure this line exists
      }
      
      // When using the refresh-session API route
      if (trigger === "update" && session?.user?.plan) {
        token.plan = session.user.plan;
        token.customerId = session.user.customerId; // Make sure this line exists
      }
      
      return token;
    }
  },
  session: {
    strategy: "jwt" as const, // Ensure the strategy is correctly typed
  },
  theme: {
    brandColor: config.colors.main,
    logo: `https://${config.domainName}/logoAndName.png`,
  },
};

export default NextAuth(authOptions);
