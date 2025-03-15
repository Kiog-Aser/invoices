import Link from "next/link";
import config from "@/config";
import { BsLightningCharge, BsBarChart, BsPeople, BsBullseye } from "react-icons/bs";

// Define industries (niches) with specific examples and metrics
const industries = [
  { 
    id: "ecommerce", 
    name: "E-commerce Store",
    metrics: ["conversion rate", "average order value", "cart abandonment rate"],
    examples: ["product reviews", "limited-time offers", "cart abandonment", "new arrivals"],
    segments: ["fashion", "electronics", "beauty", "home goods", "food & beverage"]
  },
  { 
    id: "saas",
    name: "SaaS Platform",
    metrics: ["trial conversion rate", "churn rate", "feature adoption"],
    examples: ["feature updates", "trial expiration", "onboarding tips", "usage milestones"],
    segments: ["productivity", "marketing", "developer tools", "business analytics", "customer support"]
  },
  {
    id: "blog",
    name: "Content Creation",
    metrics: ["subscriber conversion", "engagement rate", "time on page"],
    examples: ["new articles", "subscriber milestones", "content series", "community updates"],
    segments: ["tech", "lifestyle", "business", "education", "entertainment"]
  }
] as const;

// Define roles for targeting
const roles = [
  {
    id: "marketer",
    name: "Marketing Professional",
    goals: ["increase conversion rates", "improve engagement", "reduce acquisition costs"],
    kpis: ["CAC", "ROI", "conversion rate"]
  },
  {
    id: "founder",
    name: "Startup Founder",
    goals: ["grow revenue", "reduce churn", "increase customer satisfaction"],
    kpis: ["MRR", "churn rate", "NPS"]
  },
  {
    id: "product",
    name: "Product Manager",
    goals: ["increase feature adoption", "improve user retention", "boost user satisfaction"],
    kpis: ["feature usage", "retention rate", "user satisfaction"]
  }
] as const;

// Topics with specific metrics and goals
const topics = [
  {
    id: "conversion",
    name: "Conversion Optimization",
    metrics: ["conversion rate", "bounce rate", "average order value"],
    tactics: ["A/B testing", "social proof", "urgency triggers"]
  },
  {
    id: "engagement",
    name: "User Engagement",
    metrics: ["session duration", "pages per visit", "return rate"],
    tactics: ["personalization", "gamification", "interactive content"]
  },
  {
    id: "retention",
    name: "Customer Retention",
    metrics: ["churn rate", "lifetime value", "repeat purchase rate"],
    tactics: ["loyalty programs", "reactivation campaigns", "personalized offers"]
  }
] as const;

interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  content: JSX.Element;
  category: 'landing-page' | 'conversion' | 'engagement' | 'social-proof' | 'strategy';
  tags: string[];
  relatedGuides?: string[];
  readingTime?: string;
  publishedAt: string;
  author?: {
    name: string;
    role: string;
  };
}

// Components for consistent styling
const GuideSection = ({ 
  title, 
  children, 
  icon: Icon 
}: { 
  title: string; 
  children: React.ReactNode; 
  icon: React.ComponentType<{ className?: string }> 
}) => (
  <div className="mb-12">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
    {children}
  </div>
);

const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="card bg-base-200">
    <div className="card-body">
      <h3 className="card-title text-lg mb-2">{title}</h3>
      {children}
    </div>
  </div>
);

const MetricsCard = ({ metrics }: { metrics: string[] }) => (
  <div className="card bg-primary/5 border border-primary/10">
    <div className="card-body">
      <h3 className="card-title text-lg mb-4">Key Metrics to Track</h3>
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center gap-3">
            <BsBarChart className="text-primary" />
            <span>{metric}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const GuideCTA = () => (
  <div className="my-12 card bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5">
    <div className="card-body text-center">
      <h3 className="card-title text-xl justify-center mb-3">Ready to Boost Your Conversions?</h3>
      <p className="mb-6">
        Start using NotiFast to implement these strategies and see your conversion rates soar.
      </p>
      <div className="justify-center">
        <Link href="/#pricing" className="btn btn-primary">
          Try NotiFast Free
        </Link>
      </div>
    </div>
  </div>
);

// Helper function for proper title case
function toTitleCase(str: string): string {
  const minorWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);
  return str.split(' ').map((word, index) => {
    if (index === 0 || !minorWords.has(word.toLowerCase())) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return word.toLowerCase();
  }).join(' ');
}

// Helper function to capitalize segment names
function formatSegmentName(segment: string): string {
  return segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

// Generate guides programmatically
function generateGuides(): Guide[] {
  const guides: Guide[] = [];

  industries.forEach(industry => {
    industry.segments.forEach(segment => {
      roles.forEach(role => {
        topics.forEach(topic => {
          const formattedSegment = formatSegmentName(segment);
          const guide: Guide = {
            slug: `${topic.id}-guide-${industry.id}-${segment}-${role.id}`.toLowerCase().replace(/\s+/g, '-'),
            title: toTitleCase(`${topic.name} Guide for ${formattedSegment} ${industry.name}: A ${role.name}'s Perspective`),
            excerpt: `Learn how to optimize ${topic.name.toLowerCase()} for your ${formattedSegment.toLowerCase()} ${industry.name.toLowerCase()} and achieve ${role.goals[0]}.`,
            category: 'strategy',
            tags: [industry.id, role.id, topic.id, segment],
            readingTime: "4 min read",
            publishedAt: new Date().toISOString(),
            author: {
              name: "NotiFast Team",
              role: "Conversion Strategy Team"
            },
            content: generateGuideContent({ 
              industry, 
              segment: formattedSegment, 
              role, 
              topic 
            })
          };
          guides.push(guide);
        });
      });
    });
  });

  return guides;
}

function generateGuideContent({ 
  industry, 
  segment, 
  role, 
  topic 
}: { 
  industry: typeof industries[number];
  segment: string;
  role: typeof roles[number];
  topic: typeof topics[number];
}): JSX.Element {
  return (
    <div className="prose prose-lg max-w-none">
      <GuideCTA />
      
      <GuideSection title="Overview" icon={BsLightningCharge}>
        <p className="lead text-lg text-base-content/80">
          As a {role.name} in the {segment} {industry.name} space, optimizing your {topic.name.toLowerCase()} 
          is crucial for achieving {role.goals[0]}.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 my-8">
          <InfoCard title="Industry Challenges">
            <ul className="space-y-2">
              {industry.examples.map((example, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary/60" />
                  {example}
                </li>
              ))}
            </ul>
          </InfoCard>
          
          <MetricsCard metrics={[...new Set([...role.kpis, ...topic.metrics])]} />
        </div>
      </GuideSection>

      <GuideSection title="Implementation Strategy" icon={BsBullseye}>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <InfoCard title="Best Practices">
            <ul className="space-y-2">
              {topic.tactics.map((tactic, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary/60" />
                  {tactic}
                </li>
              ))}
            </ul>
          </InfoCard>
          
          <InfoCard title={`${segment} Specific Tips`}>
            <ul className="space-y-2">
              <li>Customize messaging for {segment} audience</li>
              <li>Focus on {industry.metrics[0]}</li>
              <li>Monitor {role.kpis[0]} impact</li>
            </ul>
          </InfoCard>
        </div>
      </GuideSection>

      <GuideSection title="Next Steps" icon={BsPeople}>
        <div className="card bg-base-200 p-6">
          <h3 className="font-bold mb-4">Your Action Plan</h3>
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="font-bold text-primary">1.</span>
              Set up NotiFast notifications targeting {segment} customers
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-primary">2.</span>
              Implement {topic.tactics[0]} using our templates
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-primary">3.</span>
              Track {role.kpis[0]} to measure impact
            </li>
          </ol>
        </div>
      </GuideSection>

      <GuideCTA />
    </div>
  );
}

const guides = generateGuides();

export default guides;