import { Metadata } from "next";
import { getSEOTags } from "@/libs/seo";
import guides from "./guides-data";
import { notFound } from "next/navigation";
import Link from "next/link";

interface GuideParams {
  params: {
    slug: string;
  };
}

type Guide = typeof guides[0];

export async function generateMetadata({ params }: GuideParams): Promise<Metadata> {
  const guide = guides.find((g: Guide) => g.slug === params.slug);
  
  if (!guide) {
    return {
      title: "Guide Not Found",
      description: "The requested guide could not be found."
    };
  }

  const metadata = {
    title: `${guide.title} | NotiFast Guide`,
    description: guide.excerpt,
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.excerpt,
      publishedTime: new Date().toISOString()
    }
  } satisfies Metadata;

  return metadata;
}

export async function generateStaticParams() {
  return guides.map((guide: Guide) => ({
    slug: guide.slug,
  }));
}

function RelatedGuides({ currentGuide }: { currentGuide: Guide }) {
  if (!currentGuide.relatedGuides?.length) return null;

  const relatedGuides = guides.filter((g: Guide) => 
    currentGuide.relatedGuides?.includes(g.slug)
  );

  if (!relatedGuides.length) return null;

  return (
    <div className="mt-16 pt-8 border-t border-base-300">
      <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {relatedGuides.map((guide: Guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="card bg-base-100 hover:shadow-lg transition-shadow"
          >
            <div className="card-body">
              <h3 className="card-title mb-2">{guide.title}</h3>
              <p className="text-base-content/70">{guide.excerpt}</p>
              {guide.readingTime && (
                <div className="text-sm text-base-content/50 mt-2">
                  {guide.readingTime}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function GuidePage({ params }: GuideParams) {
  const guide = guides.find((g: Guide) => g.slug === params.slug);
  
  if (!guide) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">{guide.title}</h1>
        <p className="text-xl text-base-content/70 mb-4">{guide.excerpt}</p>
        {guide.readingTime && (
          <div className="text-base-content/50">
            {guide.readingTime}
          </div>
        )}
      </header>

      <div className="prose prose-lg max-w-none">
        {guide.content}
      </div>

      <RelatedGuides currentGuide={guide} />
    </article>
  );
}