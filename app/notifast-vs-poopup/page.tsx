import { Metadata } from "next";
import { getSEOTags } from "@/libs/seo";
import Link from "next/link";
import { BsCheckCircleFill, BsXCircleFill, BsLightningCharge } from "react-icons/bs";

export const metadata: Metadata = {
  title: "NotiFast vs PoopUp Comparison | Better Features, Lower Price",
  description: "See how NotiFast offers more features at a better price than Poopup. Compare pricing, customization options, and advanced features side by side.",
  openGraph: {
    type: "article",
    title: "NotiFast vs PoopUp - The Ultimate Comparison",
    description: "Looking for the best notification tool? See how NotiFast offers more features at a better price than PoopUp. Detailed feature & pricing comparison.",
    publishedTime: new Date().toISOString()
  }
} satisfies Metadata;

const features = {
  basic: [
    { name: "Website Notifications", notifast: true, Poopup: true },
    { name: "Social Proof", notifast: true, Poopup: true },
    { name: "Custom Text", notifast: true, Poopup: true },
    { name: "Mobile Responsive", notifast: true, Poopup: true },
  ],
  advanced: [
    { name: "Custom Themes", notifast: true, Poopup: false },
    { name: "URL Support", notifast: true, Poopup: false },
    { name: "Close Button", notifast: true, Poopup: false },
    { name: "Loop Functionality", notifast: true, Poopup: false },
  ],
  pricing: [
    { name: "Free Plan", notifast: "✓ One Website", Poopup: "✕ Not Available" },
    { name: "Basic Plan", notifast: "$10 - Unlimited", Poopup: "$9 - One Site" },
    { name: "Pro Plan", notifast: "No extra plan", Poopup: "$19 - Unlimited" }
  ]
};

const FeatureRow = ({ feature, isHighlighted = false }: { feature: { name: string; notifast: boolean; Poopup: boolean }; isHighlighted?: boolean }) => (
  <div className={`grid grid-cols-3 gap-4 p-4 ${isHighlighted ? 'bg-primary/5 rounded-lg' : ''}`}>
    <div className="font-medium">{feature.name}</div>
    <div className="text-center">
      {feature.notifast ? (
        <BsCheckCircleFill className="inline-block w-5 h-5 text-success" />
      ) : (
        <BsXCircleFill className="inline-block w-5 h-5 text-error" />
      )}
    </div>
    <div className="text-center">
      {feature.Poopup ? (
        <BsCheckCircleFill className="inline-block w-5 h-5 text-success" />
      ) : (
        <BsXCircleFill className="inline-block w-5 h-5 text-error" />
      )}
    </div>
  </div>
);

const PricingRow = ({ feature }: { feature: { name: string; notifast: string; Poopup: string } }) => (
  <div className="grid grid-cols-3 gap-4 p-4">
    <div className="font-medium">{feature.name}</div>
    <div className="text-center font-medium">{feature.notifast}</div>
    <div className="text-center font-medium">{feature.Poopup}</div>
  </div>
);

export default function ComparisonPage() {
  return (
    <article className="max-w-5xl mx-auto px-4 py-12">
      <header className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
          NotiFast vs Poopup
        </h1>
        <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
          Looking for the best notification tool for your website? Compare NotiFast and Poopup
          side by side to see which offers better value for your business.
        </p>
      </header>

      <div className="prose prose-lg max-w-none mb-16">
        <div className="card bg-base-200 p-8">
          <h2 className="text-2xl font-bold mb-6">Why Choose NotiFast?</h2>
          <p>
            While both NotiFast and Poopup offer website notification solutions, NotiFast provides a more
            comprehensive set of features at a better price point. Let's break down the key differences:
          </p>

          <ul className="grid gap-3 mt-6">
            <li className="flex items-start gap-3">
              <BsCheckCircleFill className="w-5 h-5 text-success mt-1" />
              <div>
                <span className="font-semibold">Free Plan Available</span> - Start with one website completely free,
                unlike Poopup's paid-only model
              </div>
            </li>
            <li className="flex items-start gap-3">
              <BsCheckCircleFill className="w-5 h-5 text-success mt-1" />
              <div>
                <span className="font-semibold">Better Value</span> - Get unlimited websites for $10,
                while Poopup charges $19 for the same feature
              </div>
            </li>
            <li className="flex items-start gap-3">
              <BsCheckCircleFill className="w-5 h-5 text-success mt-1" />
              <div>
                <span className="font-semibold">More Features</span> - Enjoy custom themes,
                URL support, and loop functionality not available in Poopup
              </div>
            </li>
          </ul>
        </div>
      </div>

      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Feature Comparison</h2>
        
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-0">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-base-200 rounded-t-box">
              <div className="font-semibold">Feature</div>
              <div className="text-center font-semibold">NotiFast</div>
              <div className="text-center font-semibold">Poopup</div>
            </div>

            {/* Basic Features */}
            <div className="border-b border-base-200">
              <div className="p-4 bg-base-200/50">
                <h3 className="font-semibold">Basic Features</h3>
              </div>
              {features.basic.map((feature, index) => (
                <FeatureRow key={index} feature={feature} />
              ))}
            </div>

            {/* Advanced Features */}
            <div>
              <div className="p-4 bg-base-200/50">
                <h3 className="font-semibold">Advanced Features</h3>
              </div>
              {features.advanced.map((feature, index) => (
                <FeatureRow key={index} feature={feature} isHighlighted={true} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Pricing Comparison</h2>
        
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-0">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-base-200 rounded-t-box">
              <div className="font-semibold">Plan</div>
              <div className="text-center font-semibold">NotiFast</div>
              <div className="text-center font-semibold">Poopup</div>
            </div>

            {/* Pricing Rows */}
            {features.pricing.map((feature, index) => (
              <PricingRow key={index} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Integration & Setup</h2>
        <div className="prose prose-lg max-w-none">
          <p>
            Both NotiFast and Poopup offer simple integration processes:
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 not-prose my-8">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">NotiFast Integration</h3>
                <ul className="space-y-2 mt-4">
                  <li className="flex items-center gap-2">
                    <BsCheckCircleFill className="text-success" />
                    One-line JavaScript snippet
                  </li>
                  <li className="flex items-center gap-2">
                    <BsCheckCircleFill className="text-success" />
                    Simple dashboard setup
                  </li>
                  <li className="flex items-center gap-2">
                    <BsCheckCircleFill className="text-success" />
                    Quick start guide
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">Poopup Integration</h3>
                <ul className="space-y-2 mt-4">
                  <li className="flex items-center gap-2">
                    <BsCheckCircleFill className="text-success" />
                    Basic JavaScript installation
                  </li>
                  <li className="flex items-center gap-2">
                    <BsXCircleFill className="text-error" />
                    Limited customization options
                  </li>
                  <li className="flex items-center gap-2">
                    <BsXCircleFill className="text-error" />
                    Basic setup guide
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="card bg-primary text-primary-content p-8 mb-16">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-lg mb-6">
          Try NotiFast free and see the difference for yourself. No credit card required.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/#pricing" className="btn btn-secondary">
            View Pricing
          </Link>
          <Link href="/guides" className="btn btn-outline btn-secondary">
            Read Our Guides
          </Link>
        </div>
      </div>

      <section>
        <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
        <div className="grid gap-6">
          <div className="collapse collapse-plus bg-base-100">
            <input type="radio" name="faq" defaultChecked /> 
            <div className="collapse-title text-xl font-medium">
              Why choose NotiFast over Poopup?
            </div>
            <div className="collapse-content">
              <p>
                NotiFast offers more features at a better price point, including a free plan for single websites.
                You get advanced features like custom themes, URL support, and advanced targeting that aren't
                available with Poopup, plus unlimited websites for just $10 compared to Poopup's $19 plan.
              </p>
            </div>
          </div>

          <div className="collapse collapse-plus bg-base-100">
            <input type="radio" name="faq" />
            <div className="collapse-title text-xl font-medium">
              Can I try NotiFast before committing?
            </div>
            <div className="collapse-content">
              <p>
                Yes! Unlike Poopup, NotiFast offers a completely free plan for one website.
                This allows you to test all core features without any commitment or credit card required.
              </p>
            </div>
          </div>

          <div className="collapse collapse-plus bg-base-100">
            <input type="radio" name="faq" />
            <div className="collapse-title text-xl font-medium">
              How easy is it to switch from Poopup to NotiFast?
            </div>
            <div className="collapse-content">
              <p>
                Switching to NotiFast is straightforward. Simply remove Poopup's code from your website
                and add NotiFast's one-line JavaScript snippet. Our documentation provides detailed
                migration guides, and our support team is ready to help if needed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}