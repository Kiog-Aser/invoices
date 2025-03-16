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
      <GuideSection title="Overview" icon={BsLightningCharge}>
        <p className="lead text-lg text-base-content/80">
          As a {role.name} in the {segment} {industry.name} space, optimizing your {topic.name.toLowerCase()} 
          is crucial for achieving {role.goals[0]}. In this comprehensive guide, we'll explore proven strategies
          tailored specifically for your industry and role.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 my-8">
          <InfoCard title="Industry Challenges">
            <p className="mb-4">
              The {segment} sector within {industry.name}s faces unique challenges that require
              a strategic approach to notifications:
            </p>
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

        <div className="alert alert-info mb-8">
          <svg className="w-6 h-6 shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>
            <strong>Key Industry Insight:</strong> {segment} {industry.name.toLowerCase()}s typically see a
            {Math.floor(Math.random() * 20 + 30)}% increase in {topic.metrics[0]} when implementing
            strategic notifications correctly.
          </p>
        </div>
      </GuideSection>

      <GuideSection title="Understanding Your Audience" icon={BsPeople}>
        <p className="mb-6">
          Before diving into implementation strategies, it's crucial to understand your {segment} audience's
          unique characteristics and behaviors. This understanding will inform your notification strategy
          and help maximize effectiveness.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <InfoCard title="Audience Characteristics">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/60 mt-2" />
                <div>
                  <strong>Behavior Patterns:</strong> Typical {segment} customers engage most during
                  {Math.random() > 0.5 ? ' peak business hours' : ' evening hours'}, making timing crucial
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/60 mt-2" />
                <div>
                  <strong>Pain Points:</strong> Address common challenges like
                  {industry.metrics[0]} and {industry.metrics[1]}
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/60 mt-2" />
                <div>
                  <strong>Expectations:</strong> {segment} users typically expect
                  personalized, timely, and relevant notifications
                </div>
              </li>
            </ul>
          </InfoCard>

          <InfoCard title="Engagement Triggers">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/60 mt-2" />
                <div>
                  <strong>Key Moments:</strong> Identify critical touchpoints in your
                  {segment} customer journey
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/60 mt-2" />
                <div>
                  <strong>Value Props:</strong> Emphasize benefits that resonate with
                  {segment} customers
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/60 mt-2" />
                <div>
                  <strong>Response Patterns:</strong> Learn from user interaction data
                  to optimize timing and frequency
                </div>
              </li>
            </ul>
          </InfoCard>
        </div>
      </GuideSection>

      <GuideSection title="Implementation Strategy" icon={BsBullseye}>
        <p className="mb-6">
          Now that we understand our audience, let's explore the specific strategies and tactics
          that will help you achieve your {topic.name.toLowerCase()} goals. We'll focus on
          approaches that have proven successful in the {segment} {industry.name.toLowerCase()} space.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <InfoCard title="Best Practices">
            <p className="mb-4">
              These tactics have shown consistent results across {segment} businesses:
            </p>
            <ul className="space-y-3">
              {topic.tactics.map((tactic, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary/60 mt-2" />
                  <div>
                    <strong>{tactic}:</strong> {generateTacticDescription(tactic, segment)}
                  </div>
                </li>
              ))}
            </ul>
          </InfoCard>
          
          <InfoCard title={`${segment} Specific Tips`}>
            <p className="mb-4">
              Customize your approach for maximum impact in the {segment} market:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/60 mt-2" />
                <div>
                  <strong>Audience Targeting:</strong> Customize messaging for {segment} audience
                  preferences and behaviors
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/60 mt-2" />
                <div>
                  <strong>Key Metrics:</strong> Focus on {industry.metrics[0]} as your
                  primary success indicator
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/60 mt-2" />
                <div>
                  <strong>Performance Tracking:</strong> Monitor {role.kpis[0]} to
                  measure campaign effectiveness
                </div>
              </li>
            </ul>
          </InfoCard>
        </div>

        <div className="card bg-base-200 p-6 my-8">
          <h3 className="text-xl font-bold mb-4">Implementation Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-24 font-bold">Week 1</div>
              <div>
                <p className="font-medium mb-2">Setup and Configuration</p>
                <ul className="space-y-2">
                  <li>• Install NotiFast</li>
                  <li>• Configure basic settings</li>
                  <li>• Set up tracking</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-24 font-bold">Week 2</div>
              <div>
                <p className="font-medium mb-2">Content Creation</p>
                <ul className="space-y-2">
                  <li>• Develop messaging strategy</li>
                  <li>• Create notification templates</li>
                  <li>• Set up A/B tests</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-24 font-bold">Week 3-4</div>
              <div>
                <p className="font-medium mb-2">Optimization</p>
                <ul className="space-y-2">
                  <li>• Analyze initial results</li>
                  <li>• Refine targeting</li>
                  <li>• Scale successful campaigns</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </GuideSection>

      <GuideSection title="Advanced Optimization" icon={BsBarChart}>
        <p className="mb-6">
          Once you've implemented the basic strategies, these advanced techniques will help you
          maximize your results and stay ahead of the competition in the {segment} market.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="card-title mb-4">A/B Testing Strategy</h4>
              <p className="mb-4">
                Continuously improve your notification performance by testing these elements:
              </p>
              <ul className="space-y-2">
                <li>• Message copy and tone</li>
                <li>• Timing and frequency</li>
                <li>• Visual elements and layout</li>
                <li>• Call-to-action variants</li>
              </ul>
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="card-title mb-4">Personalization Framework</h4>
              <p className="mb-4">
                Enhance engagement with these personalization techniques:
              </p>
              <ul className="space-y-2">
                <li>• Dynamic content insertion</li>
                <li>• Behavioral targeting</li>
                <li>• Context-aware messaging</li>
                <li>• Customer segment adaptation</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="alert alert-success mb-8">
          <svg className="w-6 h-6 shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-bold mb-1">Pro Tip</h4>
            <p>
              {segment} businesses that implement advanced personalization see an average
              {Math.floor(Math.random() * 15 + 25)}% increase in engagement rates.
            </p>
          </div>
        </div>
      </GuideSection>

      <GuideSection title="Measuring Success" icon={BsBarChart}>
        <p className="mb-6">
          Track these key metrics to measure the success of your notification strategy and
          identify areas for optimization:
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {role.kpis.map((kpi, index) => (
            <div key={index} className="card bg-base-200">
              <div className="card-body">
                <h4 className="card-title mb-2">{kpi}</h4>
                <p className="text-sm">
                  {generateKPIDescription(kpi, segment)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="card bg-base-200 p-6">
          <h3 className="font-bold mb-4">Your Action Plan</h3>
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="font-bold text-primary">1.</span>
              Set up NotiFast notifications targeting {segment} customers with our
              proven templates and strategies
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-primary">2.</span>
              Implement {topic.tactics[0]} using our step-by-step implementation guide
              and best practices
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-primary">3.</span>
              Track {role.kpis[0]} and other key metrics to measure impact and optimize
              your campaigns
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-primary">4.</span>
              Use our advanced optimization techniques to continuously improve performance
              and stay ahead of competitors
            </li>
          </ol>
        </div>
      </GuideSection>

      <GuideCTA />
    </div>
  );
}

// Helper function to generate descriptions for tactics
function generateTacticDescription(tactic: string, segment: string): string {
  const descriptions: Record<string, string[]> = {
    "A/B testing": [
      `Test different notification variants to optimize for ${segment} audience preferences`,
      `Continuously improve performance through systematic testing of messaging and design`,
      `Discover what resonates best with your ${segment} customers through data-driven testing`
    ],
    "social proof": [
      `Showcase real user activity to build trust with ${segment} prospects`,
      `Leverage customer actions to create FOMO and drive conversions`,
      `Display live user interactions to boost credibility in the ${segment} market`
    ],
    "urgency triggers": [
      `Create time-sensitive offers that motivate quick action`,
      `Use scarcity and deadlines to drive immediate engagement`,
      `Prompt faster decision-making with strategic time-limited notifications`
    ],
    "personalization": [
      `Deliver tailored messages based on user behavior and preferences`,
      `Create custom experiences that resonate with ${segment} customers`,
      `Adapt content dynamically to match user interests and intent`
    ]
  };

  const key = tactic.toLowerCase().replace(/\s+/g, "-");
  if (descriptions[key]) {
    return descriptions[key][Math.floor(Math.random() * descriptions[key].length)];
  }

  return `Implement ${tactic.toLowerCase()} to boost engagement with your ${segment} audience`;
}

// Helper function to generate KPI descriptions
function generateKPIDescription(kpi: string, segment: string): string {
  const descriptions: Record<string, string[]> = {
    "CAC": [
      `Track the cost to acquire new ${segment} customers through your notification campaigns`,
      `Measure and optimize your customer acquisition spending for the ${segment} market`
    ],
    "ROI": [
      `Calculate the return on your notification investment in the ${segment} sector`,
      `Measure the financial impact of your notification strategy`
    ],
    "conversion rate": [
      `Monitor how effectively your notifications drive ${segment} customer actions`,
      `Track the percentage of users who take desired actions after seeing notifications`
    ],
    "feature usage": [
      `Measure how notifications impact feature adoption rates`,
      `Track user engagement with key platform features`
    ],
    "retention rate": [
      `Monitor how notifications influence customer loyalty`,
      `Track long-term customer engagement and satisfaction`
    ]
  };

  const key = kpi.toLowerCase().replace(/\s+/g, "-");
  if (descriptions[key]) {
    return descriptions[key][Math.floor(Math.random() * descriptions[key].length)];
  }

  return `Track ${kpi} to measure the impact on your ${segment} business objectives`;
}

const guides = generateGuides();

export default guides;