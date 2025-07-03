import NextAuth from "next-auth";
import { authOptions } from "@/libs/next-auth";

// Prevent caching for authentication routes
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };