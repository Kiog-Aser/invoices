import { Metadata } from "next";
import Link from "next/link";
import guides from "./[slug]/guides-data";

export const metadata: Metadata = {
  title: "Notification Strategy Guides & Best Practices | NotiFast",
  description: "Learn proven strategies for using notifications to boost conversions, enhance user engagement, and create better user experiences.",
  openGraph: {
    type: "website",
    title: "Notification Strategy Guides & Best Practices",
    description: "Expert guides on notification strategy, landing page optimization, and conversion rate optimization."
  }
} satisfies Metadata;

const categories = {
  'landing-page': 'Landing Page Optimization',
  'conversion': 'Conversion Rate Optimization',
  'engagement': 'User Engagement',
  'social-proof': 'Social Proof',
  'strategy': 'Notification Strategy'
} as const;

type CategoryType = keyof typeof categories;
type Guide = typeof guides[0];

export default function GuidesPage() {
  const guidesByCategory = guides.reduce((acc, guide: Guide) => {
    if (!acc[guide.category]) {
      acc[guide.category] = [];
    }
    acc[guide.category].push(guide);
    return acc;
  }, {} as Record<CategoryType, Guide[]>);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Notification Guides & Best Practices</h1>
        <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
          Learn how to leverage notifications effectively to boost conversions, 
          enhance user engagement, and create better user experiences.
        </p>
      </header>

      <div className="grid gap-16">
        {Object.entries(guidesByCategory).map(([category, categoryGuides]) => (
          <section key={category} className="scroll-m-20" id={category}>
            <h2 className="text-2xl font-bold mb-6">{categories[category as CategoryType]}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {categoryGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="card bg-base-100 hover:shadow-lg transition-shadow"
                >
                  <div className="card-body">
                    <h3 className="card-title mb-2">{guide.title}</h3>
                    <p className="text-base-content/70 mb-4">{guide.excerpt}</p>
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {guide.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="badge badge-primary badge-outline">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {guide.readingTime && (
                        <div className="text-sm text-base-content/50">
                          {guide.readingTime}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}