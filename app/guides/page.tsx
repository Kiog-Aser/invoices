import { Metadata } from "next";
import Link from "next/link";
import guides from "./[slug]/guides-data";
import GuidesWrapper from "@/components/GuidesWrapper";
import { BsBook, BsBarChart, BsLightning, BsChevronLeft, BsChevronRight } from "react-icons/bs";

// Define niches for the GuidesWrapper component
const niches = [
  { id: "ecommerce", name: "E-commerce" },
  { id: "saas", name: "SaaS" },
  { id: "blog", name: "Content Creation" }
];

export const metadata: Metadata = {
  title: "Notification Strategy Guides by Industry | NotiFast",
  description: "Expert notification strategies for every industry. Find tailored guides to boost conversions, engagement, and retention with smart notifications.",
  openGraph: {
    type: "website",
    title: "Notification Strategy Guides by Industry",
    description: "Expert notification strategies tailored for your industry. Boost conversions with proven tactics."
  }
} satisfies Metadata;

const categories = {
  'strategy': 'Implementation Strategies',
  'landing-page': 'Landing Page Optimization',
  'conversion': 'Conversion Rate Optimization',
  'engagement': 'User Engagement',
  'social-proof': 'Social Proof'
} as const;

type CategoryType = keyof typeof categories;
type Guide = typeof guides[0];

const GUIDES_PER_PAGE = 12;

// Helper function for pagination display
function getPaginationRange(currentPage: number, totalPages: number): number[] {
  const delta = 2;
  const range: number[] = [];
  const rangeWithDots: number[] = [];

  range.push(1);

  if (totalPages <= 1) return range;

  let left = currentPage - delta;
  let right = currentPage + delta;

  if (left <= 0) {
    right = right - left + 1;
    left = 1;
  }

  if (right > totalPages) {
    left = Math.max(1, left - (right - totalPages));
    right = totalPages;
  }

  for (let i = left; i <= right; i++) {
    if (i !== 1 && i !== totalPages) {
      range.push(i);
    }
  }

  if (totalPages > 1) {
    range.push(totalPages);
  }

  let l: number | undefined;
  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push(-1); // Represents dots
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

export default function GuidesPage({
  searchParams
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const selectedNiche = searchParams?.niche as string | undefined;
  const selectedRole = searchParams?.role as string | undefined;
  const selectedTopic = searchParams?.topic as string | undefined;
  const selectedSegment = searchParams?.segment as string | undefined;
  const page = Number(searchParams?.page) || 1;
  
  // Filter guides based on selected criteria
  const filteredGuides = guides.filter(guide => {
    if (selectedNiche && !guide.tags.includes(selectedNiche)) return false;
    if (selectedRole && !guide.tags.includes(selectedRole)) return false;
    if (selectedTopic && !guide.tags.includes(selectedTopic)) return false;
    if (selectedSegment && !guide.tags.includes(selectedSegment)) return false;
    return true;
  });

  // Group guides by category
  const guidesByCategory = filteredGuides.reduce((acc, guide: Guide) => {
    if (!acc[guide.category]) {
      acc[guide.category] = [];
    }
    acc[guide.category].push(guide);
    return acc;
  }, {} as Record<CategoryType, Guide[]>);

  // Calculate pagination
  const totalGuides = filteredGuides.length;
  const totalPages = Math.ceil(totalGuides / GUIDES_PER_PAGE);
  const startIndex = (page - 1) * GUIDES_PER_PAGE;
  const endIndex = startIndex + GUIDES_PER_PAGE;
  const paginatedGuides = filteredGuides.slice(startIndex, endIndex);

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
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto mb-8">
            Learn proven strategies to boost conversions and engagement with notifications. 
            Find guides tailored for your industry and use case.
          </p>

          {/* Quick stats */}
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-primary">
                <BsBook className="w-6 h-6" />
              </div>
              <div className="stat-title">Total Guides</div>
              <div className="stat-value text-primary">{guides.length}</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-primary">
                <BsBarChart className="w-6 h-6" />
              </div>
              <div className="stat-title">Industries</div>
              <div className="stat-value text-primary">{niches.length}</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-primary">
                <BsLightning className="w-6 h-6" />
              </div>
              <div className="stat-title">Success Rate</div>
              <div className="stat-value text-primary">37%</div>
              <div className="stat-desc">Avg. conversion lift</div>
            </div>
          </div>
        </header>

        <GuidesWrapper niches={niches}>
          <div className="grid gap-16">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedGuides.map((guide) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Link
                  href={{
                    pathname: '/guides',
                    query: {
                      ...searchParams,
                      page: Math.max(1, page - 1)
                    }
                  }}
                  className={`btn btn-sm ${page <= 1 ? 'btn-disabled' : 'btn-ghost'}`}
                  aria-label="Previous page"
                >
                  <BsChevronLeft className="w-4 h-4" />
                </Link>

                {getPaginationRange(page, totalPages).map((pageNum, index) => (
                  pageNum === -1 ? (
                    <span key={`dots-${index}`} className="px-2">...</span>
                  ) : (
                    <Link
                      key={pageNum}
                      href={{
                        pathname: '/guides',
                        query: {
                          ...searchParams,
                          page: pageNum
                        }
                      }}
                      className={`btn btn-sm ${pageNum === page ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      {pageNum}
                    </Link>
                  )
                ))}

                <Link
                  href={{
                    pathname: '/guides',
                    query: {
                      ...searchParams,
                      page: Math.min(totalPages, page + 1)
                    }
                  }}
                  className={`btn btn-sm ${page >= totalPages ? 'btn-disabled' : 'btn-ghost'}`}
                  aria-label="Next page"
                >
                  <BsChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {filteredGuides.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No guides found</h3>
                <p className="text-base-content/70">
                  Try adjusting your filters to find more guides.
                </p>
              </div>
            )}
          </div>
        </GuidesWrapper>
      </div>
    </div>
  );
}