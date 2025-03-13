import { Metadata } from "next";
import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import { ARTICLES } from "@/constants/articles";
import { BlogArticleContent } from "@/components/BlogArticleContent";

export function generateMetadata({ params }: { params: { articleId: string } }): Metadata {
  const article = ARTICLES.find((article) => article.slug === params.articleId);
  
  if (!article) {
    return getSEOTags({
      title: "Article not found",
      description: "The article you're looking for doesn't exist",
      canonicalUrlRelative: "/blog",
    });
  }

  return getSEOTags({
    title: article.title,
    description: article.description,
    canonicalUrlRelative: `/blog/${article.slug}`,
    extraTags: {
      openGraph: {
        title: article.title,
        description: article.description,
        url: `/blog/${article.slug}`,
        images: [
          {
            url: article.image.urlRelative,
            width: 1200,
            height: 660,
          },
        ],
      },
      locale: "en_US",
      type: "website",
    },
  });
}

export default function BlogArticle({ params }: { params: { articleId: string } }) {
  const article = ARTICLES.find((article) => article.slug === params.articleId);
  if (!article) {
    // Add null check and provide a fallback UI
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">Article not found</h1>
        <p className="mt-4">The article you're looking for doesn't exist.</p>
        <Link href="/blog" className="mt-6 btn btn-primary">
          Back to Blog
        </Link>
      </div>
    );
  }

  return <BlogArticleContent article={article} />;
}
