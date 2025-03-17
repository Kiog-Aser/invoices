import "next-auth";
import type { DefaultSession } from 'next-auth';

declare module "next-auth" {
  interface User {
    id: string;
    plan?: string;
    customerId?: string;
    email: string;
    image?: string;
    name?: string;
    isAdmin?: boolean;
  }

  interface Session {
    user: User & {
      id: string;
      plan: string;
      customerId: string;
      isAdmin: boolean;
    } & DefaultSession['user'];
    token: {
      id: string;
      plan: string;
      customerId: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    plan?: string;
    customerId?: string;
  }
}
