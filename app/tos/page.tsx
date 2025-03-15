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

const TOS = () => {
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
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Terms and Conditions for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: March 14, 2025

Terms & Services
Effective Date: March 14, 2025

Welcome to NotiFast! By accessing or using our website (https://notifa.st) and services, you agree to the following Terms & Services. If you do not agree, please do not use our services.

1. Services
NotiFast provides tools to increase conversions with simulated notifications. Users can utilize pre-built templates or create their own. By purchasing the Pro Plan, users receive lifetime access to all Pro features, including updates.

2. User Data Collection
We collect the following personal data:
- Name
- Email
- Payment Information
Additionally, we collect non-personal data through web cookies. For more details, please refer to our Privacy Policy: https://notifa.st/privacy-policy.

3. Payments & Refunds
All purchases are final. Refunds are not provided unless required by law.

4. User Responsibilities
Users agree to use NotiFast in compliance with applicable laws and not for fraudulent or misleading purposes.

5. Modifications & Updates
NotiFast reserves the right to update these Terms & Services. Users will be notified via email of any changes.

6. Governing Law
These Terms & Services are governed by the laws of Belgium.

7. Contact Information
For any questions, please contact us at: mil@notifa.st.

By using NotiFast, you acknowledge that you have read, understood, and agreed to these Terms & Services.`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
