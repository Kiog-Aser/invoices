import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR TERMS & SERVICES — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple Terms & Services for my website. Here is some context:
// - Website: https://shipfa.st
// - Name: ShipFast
// - Contact information: marc@shipfa.st
// - Description: A JavaScript code boilerplate to help entrepreneurs launch their startups faster
// - Ownership: when buying a package, users can download code to create apps. They own the code but they do not have the right to resell it. They can ask for a full refund within 7 day after the purchase.
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Link to privacy-policy: https://shipfa.st/privacy-policy
// - Governing Law: France
// - Updates to the Terms: users will be updated by email

// Please write a simple Terms & Services for my site. Add the current date. Do not add or explain your reasoning. Answer:

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-base-content">
      <h1 className="text-3xl font-bold mb-6 font-mono">Terms of Service</h1>
      <div className="prose prose-neutral max-w-none">
        <p>Welcome to {process.env.NEXT_PUBLIC_APP_NAME || "SaaS Boilerplate"}! By using this website and service, you agree to the following terms. If you do not agree, please do not use our services.</p>
        <h2>1. Services</h2>
        <p>This boilerplate provides a starting point for SaaS products. You are responsible for customizing and deploying your own product.</p>
        <h2>2. User Data</h2>
        <p>We do not collect or store any personal data by default. If you deploy your own SaaS, you are responsible for your users' data and compliance with applicable laws.</p>
        <h2>3. Payments & Refunds</h2>
        <p>All payments are handled by your own Stripe integration. This boilerplate does not process payments on your behalf.</p>
        <h2>4. User Responsibilities</h2>
        <p>You agree to use this boilerplate in compliance with all applicable laws and not for fraudulent or malicious purposes.</p>
        <h2>5. Modifications</h2>
        <p>These terms may be updated at any time. Please review them regularly.</p>
        <h2>6. Disclaimer</h2>
        <p>This boilerplate is provided as-is, without warranty of any kind. Use at your own risk.</p>
      </div>
    </main>
  );
}
