import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import config from "@/config";

// Ensure this layout is dynamically rendered as it uses server-side session checks
export const dynamic = 'force-dynamic';

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
// It's applied to all subpages of /dashboard in /app/dashboard/*** pages
// You can also add custom static UI elements like a Navbar, Sidebar, Footer, etc..
// See https://shipfa.st/docs/tutorials/private-page
export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      redirect(config.auth.loginUrl);
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Dashboard layout error:", error);
    // Redirect to login on error to prevent infinite refresh
    redirect(config.auth.loginUrl);
  }
}
