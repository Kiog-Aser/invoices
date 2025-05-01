import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-base-content">
      <h1 className="text-3xl font-bold mb-6 font-mono">Privacy Policy</h1>
      <div className="prose prose-neutral max-w-none">
        <p>This SaaS boilerplate does not collect or store any personal data by default. If you deploy your own SaaS using this codebase, you are responsible for your users' privacy and compliance with applicable laws (such as GDPR, CCPA, etc.).</p>
        <h2>1. Data Collection</h2>
        <p>No personal data is collected by this boilerplate. If you add user accounts, analytics, or third-party services, you must update your privacy policy accordingly.</p>
        <h2>2. Cookies</h2>
        <p>This boilerplate does not set cookies by default. If you add authentication or analytics, cookies may be used.</p>
        <h2>3. Third-Party Services</h2>
        <p>If you integrate third-party services (e.g., Stripe, analytics), you are responsible for disclosing their data practices to your users.</p>
        <h2>4. Changes to This Policy</h2>
        <p>This privacy policy may be updated at any time. Please review it regularly.</p>
      </div>
    </main>
  );
}
