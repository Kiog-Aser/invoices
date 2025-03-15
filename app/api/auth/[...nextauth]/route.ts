import NextAuth from "next-auth";
import { authOptions } from "@/libs/next-auth";

// Force dynamic to prevent caching issues with authentication
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };