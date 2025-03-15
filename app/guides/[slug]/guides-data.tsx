import Link from "next/link";
import config from "@/config";

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
  <div className="my-8 p-6 bg-base-200 rounded-lg text-center">
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

const guides: Guide[] = [
  {
    slug: "landing-page-notification-placement",
    title: "Strategic Notification Placement for Landing Pages",
    excerpt: "Learn where to place notifications on your landing page for maximum impact and higher conversion rates",
    category: "landing-page",
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
    category: "social-proof",
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