import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    plan?: string;
    customerId?: string;
    email: string;
    image?: string;
    name?: string;
  }

  interface Session {
    user: User & {
      id: string;
      plan: string;
      customerId: string;
    };
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
