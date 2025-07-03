import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import type { JWT } from "next-auth/jwt";
import clientPromise from "@/libs/mongo";
import config from "@/config";

// Get the domain from NEXTAUTH_URL
const domain = process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).hostname : undefined;
const isDevelopment = process.env.NODE_ENV === "development";
const isLocalhost = domain === "localhost";

// Admin email(s) allowed to access the deployed version
const ADMIN_EMAILS = [
  "milloran@gmail.com", // Add your email here
  // Add more admin emails if needed
];

// For development with HTTP on localhost, we need different cookie settings
const cookiePrefix = isDevelopment && isLocalhost ? "" : "__Secure-";
const useSecureCookies = !(isDevelopment && isLocalhost); // Disable secure cookies for localhost HTTP

// Get the domain without subdomain for cookie settings
const getCookieDomain = (hostname: string | undefined) => {
  if (!hostname || hostname === 'localhost') return undefined;
  // Don't set a specific domain for Vercel deployments or other platforms
  if (hostname.includes('vercel.app')) return undefined;
  // For custom domains, remove www. if present and return without leading dot
  return hostname.replace(/^www\./, '');
};

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
    async signIn({ user, account, profile }) {
      // In development, allow all users
      if (isDevelopment) {
        return true;
      }
      
      // In production, only allow admin emails
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        return true;
      }
      
      // Deny access for non-admin users in production
      console.log(`Access denied for email: ${user.email}`);
      return false;
    },
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
        return config.auth.callbackUrl;
      } else if (url.startsWith("/")) {
        return config.auth.callbackUrl;
      }
      return config.auth.callbackUrl;
    }
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/",
    error: "/auth/error",
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
        domain: domain ? getCookieDomain(domain) : undefined
      }
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
        domain: domain ? getCookieDomain(domain) : undefined
      }
    },
    csrfToken: {
      name: isDevelopment && isLocalhost ? "next-auth.csrf-token" : `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies
      }
    }
  },
  useSecureCookies,
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  debug: isDevelopment,
};

export default NextAuth(authOptions);