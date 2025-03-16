import { Metadata } from "next";
import { getSEOTags } from "@/libs/seo";
import Link from "next/link";
import { BsCheckCircleFill, BsXCircleFill, BsLightningCharge } from "react-icons/bs";

export const metadata: Metadata = {
  title: "NotiFast vs PopUp Comparison | Better Features, Lower Price",
  description: "See how NotiFast offers more features at a better price than PopUp. Compare pricing, customization options, and advanced features side by side.",
  openGraph: {
    type: "article",
    title: "NotiFast vs PopUp - The Ultimate Comparison",
    description: "Looking for the best notification tool? See how NotiFast offers more features at a better price than PopUp. Detailed feature & pricing comparison.",
    publishedTime: new Date().toISOString()
  }
} satisfies Metadata;

const features = {
  basic: [
    { name: "Website Notifications", notifast: true, popup: true },
    { name: "Social Proof", notifast: true, popup: true },
    { name: "Custom Text", notifast: true, popup: true },
    { name: "Mobile Responsive", notifast: true, popup: true },
    { name: "Analytics Dashboard", notifast: true, popup: true }
  ],
  advanced: [
    { name: "Custom Themes", notifast: true, popup: false },
    { name: "URL Support", notifast: true, popup: false },
    { name: "Close Button", notifast: true, popup: false },
    { name: "Loop Functionality", notifast: true, popup: false },
    { name: "Dynamic Content", notifast: true, popup: false },
    { name: "A/B Testing", notifast: true, popup: false },
    { name: "Multiple Positions", notifast: true, popup: false },
    { name: "Unlimited Notifications", notifast: true, popup: false },
    { name: "Custom JavaScript Events", notifast: true, popup: false },
    { name: "Advanced Targeting", notifast: true, popup: false }
  ],
  pricing: [
    { name: "Free Plan", notifast: "✓ One Website", popup: "✕ Not Available" },
    { name: "Basic Plan", notifast: "$9/mo - Unlimited", popup: "$9/mo - One Site" },
    { name: "Pro Plan", notifast: "$19/mo - Agency", popup: "$19/mo - Unlimited" }
  ]
};

const FeatureRow = ({ feature, isHighlighted = false }: { feature: { name: string; notifast: boolean; popup: boolean }; isHighlighted?: boolean }) => (
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
      {feature.popup ? (
        <BsCheckCircleFill className="inline-block w-5 h-5 text-success" />
      ) : (
        <BsXCircleFill className="inline-block w-5 h-5 text-error" />
      )}
    </div>
  </div>
);

const PricingRow = ({ feature }: { feature: { name: string; notifast: string; popup: string } }) => (
  <div className="grid grid-cols-3 gap-4 p-4">
    <div className="font-medium">{feature.name}</div>
    <div className="text-center font-medium">{feature.notifast}</div>
    <div className="text-center font-medium">{feature.popup}</div>
  </div>
);

export default function ComparisonPage() {
  return (
    <article className="max-w-5xl mx-auto px-4 py-12">
      <header className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
          NotiFast vs PopUp
        </h1>
        <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
          Looking for the best notification tool for your website? Compare NotiFast and PopUp
          side by side to see which offers better value for your business.
        </p>
      </header>

      <div className="prose prose-lg max-w-none mb-16">
        <h2>Why Choose NotiFast?</h2>
        <p>
          While both NotiFast and PopUp offer website notification solutions, NotiFast provides a more
          comprehensive set of features at a better price point. Let's break down the key differences:
        </p>

        <div className="card bg-primary/5 border border-primary/10 p-6 my-8">
          <h3 className="flex items-center gap-2 text-2xl font-bold mb-4">
            <BsLightningCharge className="text-primary" />
            Key Advantages of NotiFast
          </h3>
          <ul className="grid gap-3">
            <li className="flex items-start gap-3">
              <BsCheckCircleFill className="w-5 h-5 text-success mt-1" />
              <div>
                <span className="font-semibold">Free Plan Available</span> - Start with one website completely free,
                unlike PopUp's paid-only model
              </div>
            </li>
            <li className="flex items-start gap-3">
              <BsCheckCircleFill className="w-5 h-5 text-success mt-1" />
              <div>
                <span className="font-semibold">Better Value</span> - Get unlimited websites for $9/mo,
                while PopUp charges $19/mo for the same feature
              </div>
            </li>
            <li className="flex items-start gap-3">
              <BsCheckCircleFill className="w-5 h-5 text-success mt-1" />
              <div>
                <span className="font-semibold">Advanced Features</span> - Enjoy custom themes,
                URL support, and advanced targeting options not available in PopUp
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
              <div className="text-center font-semibold">PopUp</div>
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
              <div className="text-center font-semibold">PopUp</div>
            </div>

            {/* Pricing Rows */}
            {features.pricing.map((feature, index) => (
              <PricingRow key={index} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Advanced Features Deep Dive</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title mb-4">Custom Themes</h3>
              <p className="mb-4">
                NotiFast offers fully customizable themes to match your brand identity.
                Choose from pre-built themes or create your own with custom CSS.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <BsCheckCircleFill className="text-success" />
                  Custom colors and fonts
                </li>
                <li className="flex items-center gap-2">
                  <BsCheckCircleFill className="text-success" />
                  Pre-built templates
                </li>
                <li className="flex items-center gap-2">
                  <BsCheckCircleFill className="text-success" />
                  CSS customization
                </li>
              </ul>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title mb-4">Advanced Targeting</h3>
              <p className="mb-4">
                Target specific user segments with NotiFast's advanced targeting options.
                Show the right message to the right people at the right time.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <BsCheckCircleFill className="text-success" />
                  Page-specific triggers
                </li>
                <li className="flex items-center gap-2">
                  <BsCheckCircleFill className="text-success" />
                  Time-based display
                </li>
                <li className="flex items-center gap-2">
                  <BsCheckCircleFill className="text-success" />
                  User behavior targeting
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Integration & Setup</h2>
        <div className="prose prose-lg max-w-none">
          <p>
            Both NotiFast and PopUp offer simple integration processes, but NotiFast goes the extra mile
            with additional customization options and developer-friendly features:
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
                    Custom event triggers
                  </li>
                  <li className="flex items-center gap-2">
                    <BsCheckCircleFill className="text-success" />
                    API access
                  </li>
                  <li className="flex items-center gap-2">
                    <BsCheckCircleFill className="text-success" />
                    Developer documentation
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">PopUp Integration</h3>
                <ul className="space-y-2 mt-4">
                  <li className="flex items-center gap-2">
                    <BsCheckCircleFill className="text-success" />
                    Basic JavaScript installation
                  </li>
                  <li className="flex items-center gap-2">
                    <BsXCircleFill className="text-error" />
                    No custom event support
                  </li>
                  <li className="flex items-center gap-2">
                    <BsXCircleFill className="text-error" />
                    Limited API functionality
                  </li>
                  <li className="flex items-center gap-2">
                    <BsXCircleFill className="text-error" />
                    Basic documentation
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
              Why choose NotiFast over PopUp?
            </div>
            <div className="collapse-content">
              <p>
                NotiFast offers more features at a better price point, including a free plan for single websites.
                You get advanced features like custom themes, URL support, and advanced targeting that aren't
                available with PopUp, plus unlimited websites for just $9/mo compared to PopUp's $19/mo plan.
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
                Yes! Unlike PopUp, NotiFast offers a completely free plan for one website.
                This allows you to test all core features without any commitment or credit card required.
              </p>
            </div>
          </div>

          <div className="collapse collapse-plus bg-base-100">
            <input type="radio" name="faq" />
            <div className="collapse-title text-xl font-medium">
              How easy is it to switch from PopUp to NotiFast?
            </div>
            <div className="collapse-content">
              <p>
                Switching to NotiFast is straightforward. Simply remove PopUp's code from your website
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