import { Metadata } from "next";
import Link from "next/link";
import guides from "./[slug]/guides-data";
import GuidesWrapper from "@/components/GuidesWrapper";

export const metadata: Metadata = {
  title: "Notification Strategy Guides by Industry | NotiFast",
  description: "Industry-specific guides on using notifications to boost conversions and engagement. Find strategies tailored for e-commerce, SaaS, content creators, and more.",
  openGraph: {
    type: "website",
    title: "Notification Strategy Guides by Industry",
    description: "Expert notification strategies tailored for your industry. Boost conversions with proven tactics."
  }
} satisfies Metadata;

const categories = {
  'landing-page': 'Landing Page Optimization',
  'conversion': 'Industry-Specific Strategies',
  'engagement': 'User Engagement',
  'social-proof': 'Social Proof',
  'strategy': 'Notification Strategy'
} as const;

const niches = [
  { id: "ecommerce", name: "E-commerce" },
  { id: "saas", name: "SaaS" },
  { id: "blog", name: "Content" },
  { id: "agency", name: "Agency" },
  { id: "coaching", name: "Coaching" },
  { id: "marketplace", name: "Marketplace" }
];

type CategoryType = keyof typeof categories;
type Guide = typeof guides[0];

export default function GuidesPage({
  searchParams
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const selectedNiche = searchParams?.niche as string | undefined;

  const filteredGuides = selectedNiche
    ? guides.filter(guide => guide.tags.includes(selectedNiche))
    : guides;

  const guidesByCategory = filteredGuides.reduce((acc, guide: Guide) => {
    if (!acc[guide.category]) {
      acc[guide.category] = [];
    }
    acc[guide.category].push(guide);
    return acc;
  }, {} as Record<CategoryType, Guide[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200/50 to-base-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="text-sm font-medium text-primary mb-2">Expert Guides</div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
              Notification Strategy
            </h1>
          </div>
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            Learn proven strategies to boost conversions and engagement with notifications. 
            Find guides tailored for your industry and use case.
          </p>
        </header>

        <GuidesWrapper niches={niches}>
          <div className="grid gap-16">
            {Object.entries(guidesByCategory).map(([category, categoryGuides]) => (
              categoryGuides.length > 0 && (
                <section key={category} className="scroll-m-20" id={category}>
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold">{categories[category as CategoryType]}</h2>
                    <div className="h-px flex-grow bg-base-300"></div>
                  </div>
                  
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryGuides.map((guide) => (
                      <Link
                        key={guide.slug}
                        href={`/guides/${guide.slug}`}
                        className="group card bg-base-100 hover:shadow-lg transition-all hover:-translate-y-1 border border-base-200"
                      >
                        <div className="card-body">
                          <h3 className="card-title text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                            {guide.title}
                          </h3>
                          <p className="text-base-content/70 mb-4 text-sm line-clamp-2">
                            {guide.excerpt}
                          </p>
                          <div className="flex flex-wrap gap-2 items-center justify-between mt-auto">
                            <div className="flex flex-wrap gap-2">
                              {guide.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="badge badge-primary badge-outline text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            {guide.readingTime && (
                              <div className="text-xs text-base-content/50 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {guide.readingTime}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )
            ))}
          </div>
        </GuidesWrapper>
      </div>
    </div>
  );
}