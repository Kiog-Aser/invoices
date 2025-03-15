'use client';

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

function TermsContent() {
  const searchParams = useSearchParams();
  
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>{" "}
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">Terms of Service</h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: 2025-03-14

Welcome to NotiFast. These Terms of Service ("Terms") govern your access to and use of NotiFast's website, services, and applications (collectively, the "Service"). Please read these Terms carefully before using the Service.

1. Acceptance of Terms

By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to all the terms and conditions, then you may not access or use the Service.

2. Changes to Terms

We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.

3. Privacy Policy

Your use of the Service is also subject to our Privacy Policy, which is incorporated by reference into these Terms.

4. Account Registration

You must register for an account to access certain features of the Service. You agree to provide accurate and complete information when creating your account and to update such information to keep it accurate and current.

5. Service Rules

You agree not to:
- Use the Service for any illegal purpose
- Violate any laws in your jurisdiction
- Infringe upon or violate our intellectual property rights or the intellectual property rights of others
- Harass, abuse, or harm another person
- Interfere with or disrupt the Service

6. Payment Terms

6.1. Some aspects of the Service are provided for a fee. You agree to pay all applicable fees for the Service you select.

6.2. All fees are exclusive of all taxes, levies, or duties imposed by taxing authorities.

7. Termination

We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.

8. Limitation of Liability

In no event shall NotiFast, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.

9. Disclaimer

Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind.

10. Governing Law

These Terms shall be governed by and construed in accordance with the laws of France, without regard to its conflict of law provisions.

11. Contact Information

If you have any questions about these Terms, please contact us at:

Email: mil@notifa.st

By using NotiFast, you acknowledge that you have read these Terms of Service and agree to be bound by them.`}
        </pre>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    }>
      <TermsContent />
    </Suspense>
  );
}
