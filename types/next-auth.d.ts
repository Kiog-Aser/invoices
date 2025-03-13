import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    plan?: string;
    email: string;
    image?: string;
    name?: string;
  }

  interface Session {
    user: User & {
      id: string;
      plan: string;
    };
    token: {
      id: string;
      plan: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    plan?: string;
  }
}
