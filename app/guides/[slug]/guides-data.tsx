import Link from "next/link";
import config from "@/config";

// Define niches for programmatic SEO
const niches = [
  { id: "ecommerce", name: "E-commerce Store", examples: ["product reviews", "limited-time offers", "cart abandonment", "new arrivals"] },
  { id: "saas", name: "SaaS Platform", examples: ["feature updates", "trial expiration", "onboarding tips", "usage milestones"] },
  { id: "blog", name: "Content Creator", examples: ["new articles", "subscriber milestones", "content series", "community updates"] },
  { id: "agency", name: "Digital Agency", examples: ["case studies", "service promotions", "client testimonials", "industry insights"] },
  { id: "coaching", name: "Online Coach", examples: ["course launches", "student success stories", "workshop announcements", "coaching slots"] },
  { id: "marketplace", name: "Online Marketplace", examples: ["new listings", "buyer activity", "seller milestones", "special deals"] }
] as const;

// Helper function to generate niche-specific content
function generateNicheContent(niche: typeof niches[number]) {
  return {
    title: `How to Boost Conversions as a ${niche.name}`,
    excerpt: `Learn proven notification strategies specifically designed for ${niche.name.toLowerCase()}s to increase engagement and drive more sales.`,
    content: (examples: readonly string[]) => (
      <div className="prose prose-lg max-w-none">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg mb-8">
          <p className="text-lg font-medium text-primary">
            This guide is specifically tailored for {niche.name.toLowerCase()}s looking to increase their conversion rates using smart notification strategies.
          </p>
        </div>

        <h2 className="text-2xl font-bold mb-4">Why Notifications Matter for {niche.name}s</h2>
        <p className="mb-6">
          In the competitive world of {niche.name.toLowerCase()}s, engaging your visitors at the right moment
          can make the difference between a conversion and a bounce. Strategic notifications can increase
          your conversion rates by up to 37%.
        </p>

        <div className="bg-base-200 p-6 rounded-lg mb-8">
          <h3 className="text-xl font-semibold mb-4">Key Notification Types for {niche.name}s</h3>
          <ul className="space-y-3">
            {examples.map((example) => (
              <li key={example} className="flex items-start">
                <svg className="w-6 h-6 text-primary shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{example}</span>
              </li>
            ))}
          </ul>
        </div>

        <h2 className="text-2xl font-bold mb-4">Implementation Strategy</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-lg mb-2">Timing & Placement</h3>
              <ul className="space-y-2">
                <li>• Show social proof within 5-10 seconds</li>
                <li>• Position based on content relevance</li>
                <li>• Avoid disrupting key CTAs</li>
              </ul>
            </div>
          </div>
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-lg mb-2">Content & Design</h3>
              <ul className="space-y-2">
                <li>• Keep messages concise and clear</li>
                <li>• Use your brand's voice</li>
                <li>• Include relevant imagery</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Advanced Tips</h2>
        <div className="alert alert-info mb-6">
          <svg className="w-6 h-6 shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>
            Pro Tip: Use A/B testing to optimize your notification strategy specifically for your {niche.name.toLowerCase()} audience.
          </p>
        </div>

        <div className="not-prose">
          <GuideCTA />
        </div>
      </div>
    )
  };
}

interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  content: JSX.Element;
  category: 'landing-page' | 'conversion' | 'engagement' | 'social-proof' | 'strategy';
  tags: string[];
  relatedGuides?: string[]; // Slugs of related guides
  readingTime?: string; // Estimated reading time
}

// Component for consistent CTA styling
const GuideCTA = () => (
  <div className="my-8 p-6 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg text-center">
    <h3 className="text-xl font-bold mb-3">Ready to Boost Your Conversions?</h3>
    <p className="mb-4">
      Start using NotiFast to implement these strategies and see your conversion rates soar.
    </p>
    <Link 
      href="/#pricing" 
      className="btn btn-primary"
    >
      Try NotiFast Free
    </Link>
  </div>
);

// Helper component for internal guide links
const GuideLink = ({ slug, children }: { slug: string; children: React.ReactNode }) => (
  <Link 
    href={`/guides/${slug}`}
    className="text-primary hover:underline font-medium"
  >
    {children}
  </Link>
);

// Generate guides for each niche
const nicheGuides = niches.map(niche => {
  const nicheContent = generateNicheContent(niche);
  return {
    slug: `conversion-guide-${niche.id}`,
    title: nicheContent.title,
    excerpt: nicheContent.excerpt,
    category: 'conversion' as const,
    tags: ['conversion rate', niche.id, 'notifications', 'strategy'],
    readingTime: "4 min read",
    content: nicheContent.content([...niche.examples])
  } satisfies Guide;
});

// Combine with existing guides
const guides: Guide[] = [
  ...nicheGuides,
  {
    slug: "landing-page-notification-placement",
    title: "Strategic Notification Placement for Landing Pages",
    excerpt: "Learn where to place notifications on your landing page for maximum impact and higher conversion rates",
    category: 'landing-page' as const,
    tags: ["landing page", "conversion rate", "ux design", "notifications"],
    readingTime: "4 min read",
    relatedGuides: ["social-proof-notifications-guide"],
    content: (
      <>
        <GuideCTA />
        
        <h2>Why Notification Placement Matters</h2>
        <p>
          Strategic notification placement can increase conversion rates by up to 37%. The key is to show
          the right message at the right time without disrupting the user experience. For maximum impact, 
          combine this guide with our <GuideLink slug="social-proof-notifications-guide">
          social proof notifications guide</GuideLink>.
        </p>

        <h2>Best Practices for Notification Placement</h2>
        <ul>
          <li>Top-right corner for social proof notifications</li>
          <li>Bottom-right for chat and support notifications</li>
          <li>Top-center for important announcements</li>
          <li>Avoid blocking primary CTAs or important content</li>
        </ul>

        <h2>Timing Your Notifications</h2>
        <p>
          The timing of your notifications is just as important as their placement. Here's when to show different types:
        </p>
        <ul>
          <li>Social proof: 5-10 seconds after page load</li>
          <li>Special offers: After 30 seconds or 50% scroll</li>
          <li>Exit intent: When cursor moves to close tab</li>
        </ul>

        <h2>Mobile Considerations</h2>
        <p>
          Mobile devices require special attention for notification placement:
        </p>
        <ul>
          <li>Keep notifications small and unobtrusive</li>
          <li>Avoid covering navigation elements</li>
          <li>Use bottom placement for better thumb accessibility</li>
        </ul>

        <h2>Testing and Optimization</h2>
        <p>
          Always A/B test your notification placement and timing. Key metrics to track:
        </p>
        <ul>
          <li>Click-through rates</li>
          <li>Conversion rates</li>
          <li>Bounce rates</li>
          <li>Time on page</li>
        </ul>

        <h2>Next Steps</h2>
        <p className="mb-6">
          Now that you understand notification placement, learn how to create compelling social proof
          notifications in our <GuideLink slug="social-proof-notifications-guide">
          Social Proof Notifications Guide</GuideLink>.
        </p>

        <GuideCTA />
      </>
    )
  },
  {
    slug: "social-proof-notifications-guide",
    title: "Leveraging Social Proof in Notifications",
    excerpt: "Master the art of social proof notifications to build trust and drive conversions",
    category: 'social-proof' as const,
    tags: ["social proof", "trust", "conversions", "psychology"],
    readingTime: "3 min read",
    relatedGuides: ["landing-page-notification-placement"],
    content: (
      <>
        <GuideCTA />

        <h2>The Power of Social Proof</h2>
        <p>
          Social proof is one of the most powerful psychological triggers in marketing. When visitors see
          others taking action, they're more likely to follow suit. For best results, combine these techniques
          with proper <GuideLink slug="landing-page-notification-placement">notification placement strategies</GuideLink>.
        </p>

        <h2>Types of Social Proof Notifications</h2>
        <ul>
          <li>Recent purchases</li>
          <li>User count milestones</li>
          <li>Live visitor counts</li>
          <li>Recent signups</li>
          <li>Customer reviews</li>
        </ul>

        <h2>Writing Effective Social Proof Messages</h2>
        <p>
          Your notification copy should be clear, concise, and compelling:
        </p>
        <ul>
          <li>Include specific details (location, time)</li>
          <li>Use real names when possible</li>
          <li>Keep messages short and scannable</li>
          <li>Include social proof elements (★★★★★)</li>
        </ul>

        <h2>Implementation Tips</h2>
        <p>
          For maximum effectiveness:
        </p>
        <ul>
          <li>Rotate between different types of social proof</li>
          <li>Keep notifications fresh and recent</li>
          <li>Test different display durations</li>
          <li>Ensure mobile responsiveness</li>
        </ul>

        <h2>Next Steps</h2>
        <p className="mb-6">
          Now that you understand social proof, learn where to place these notifications for maximum impact
          in our <GuideLink slug="landing-page-notification-placement">Landing Page Notification Placement Guide</GuideLink>.
        </p>

        <GuideCTA />
      </>
    )
  }
];

export default guides;