import Link from "next/link";
import Script from "next/script";
import { articles } from "../_assets/content";
import BadgeCategory from "../_assets/components/BadgeCategory";
import Avatar from "../_assets/components/Avatar";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export function generateMetadata({ params }: { params: { articleId: string } }): Metadata {
  const article = articles.find((article) => article.slug === params.articleId);
  
  // Add null check before accessing article properties
}) { (!article) {
  const article = articles.find((article) => article.slug === params.articleId);
      title: "Article not found",
  return getSEOTags({he article you're looking for doesn't exist",
    title: article.title,e: "/blog",
    description: article.description,
    canonicalUrlRelative: `/blog/${article.slug}`,
    extraTags: {
      openGraph: {s({
        title: article.title,
        description: article.description,
        url: `/blog/${article.slug}`,ticle.slug}`,
        images: [
          {raph: {
            url: article.image.urlRelative,
            width: 1200,icle.description,
            height: 660,ticle.slug}`,
          },es: [
        ],{
        locale: "en_US",.image.urlRelative,
        type: "website",
      },    height: 660,
    },    },
  });   ],
}       locale: "en_US",
        type: "website",
export default function BlogArticle({ params }: { params: { articleId: string } }) {
  const article = ARTICLES.find((article) => article.slug === params.articleId);
  ;
  // Add null check and provide a fallback UI
  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">Article not found</h1>
        <p className="mt-4">The article you're looking for doesn't exist.</p>articleId: string };
        <Link href="/blog" className="mt-6 btn btn-primary">
          Back to Blog(article) => article.slug === params.articleId);
        </Link>
      </div>er(
    ); (a) =>
  }slug !== params.articleId &&
ories.some((c) =>
  const articlesRelated = articles
    .filter(   )
      (a) =>
        a.slug !== params.articleId &&    .sort(
        a.categories.some((c) =>b) =>
          article.categories.map((c) => c.slug).includes(c.slug)  new Date(b.publishedAt).valueOf() - new Date(a.publishedAt).valueOf()
        )
    ) 3);
    .sort(
      (a, b) =>
        new Date(b.publishedAt).valueOf() - new Date(a.publishedAt).valueOf()
    )R GOOGLE */}
    .slice(0, 3);
on"
  return (article.slug}`}
    <>{
      {/* SCHEMA JSON-LD MARKUP FOR GOOGLE */}
      <Scriptcontext": "https://schema.org",
        type="application/ld+json"
        id={`json-ld-article-${article.slug}`}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            mainEntityOfPage: { article.title,
              "@type": "WebPage",.description,
              "@id": `https://${config.domainName}/blog/${article.slug}`,ainName}${article.image.urlRelative}`,
            },tePublished: article.publishedAt,
            name: article.title,ateModified: article.publishedAt,
            headline: article.title,  author: {
            description: article.description,      "@type": "Person",
            image: `https://${config.domainName}${article.image.urlRelative}`,              name: article.author.name,
            datePublished: article.publishedAt,
            dateModified: article.publishedAt,),
            author: {
              "@type": "Person",
              name: article.author.name,
            },
          }),v>
        }}
      />
nderline text-base-content/80 hover:text-base-content inline-flex items-center gap-1"
      {/* GO BACK LINK */}
      <div>
        <Linksvg
          href="/blog"="http://www.w3.org/2000/svg"
          className="link !no-underline text-base-content/80 hover:text-base-content inline-flex items-center gap-1"
          title="Back to Blog"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"h
            viewBox="0 0 20 20"="evenodd"
            fill="currentColor"="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
            className="w-5 h-5"  clipRule="evenodd"
          >            />
            <path>
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to BlogAND DATE AND TITLE */}
        </Link>d:my-20 max-w-[800px]">
      </div>enter gap-4 mb-6">
icle.categories.map((category) => (
      <article>BadgeCategory
        {/* HEADER WITH CATEGORIES AND DATE AND TITLE */}
        <section className="my-12 md:my-20 max-w-[800px]">
          <div className="flex items-center gap-4 mb-6">adge-lg"
            {article.categories.map((category) => (
              <BadgeCategory
                category={category} className="text-base-content/80" itemProp="datePublished">
                key={category.slug}Date(article.publishedAt).toLocaleDateString("en-US", {
                extraStyle="!badge-lg"month: "long",
              />                day: "numeric",
            ))}
            <span className="text-base-content/80" itemProp="datePublished">
              {new Date(article.publishedAt).toLocaleDateString("en-US", {pan>
                month: "long",          </div>
                day: "numeric",
                year: "numeric", md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 md:mb-8">
              })}rticle.title}
            </span>
          </div>
t-lg max-w-[700px]">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 md:mb-8">
            {article.title}
          </h1>

          <p className="text-base-content/80 md:text-lg max-w-[700px]">ssName="flex flex-col md:flex-row">
            {article.description} RELATED ARTICLES */}
          </p>          <section className="max-md:pb-4 md:pl-12 max-md:border-b md:border-l md:order-last md:w-72 shrink-0 border-base-content/10">
        </section>80 text-sm mb-2 md:mb-3">

        <div className="flex flex-col md:flex-row">
          {/* SIDEBAR WITH AUTHORS AND 3 RELATED ARTICLES */}cle} />
          <section className="max-md:pb-4 md:pl-12 max-md:border-b md:border-l md:order-last md:w-72 shrink-0 border-base-content/10">
            <p className="text-base-content/80 text-sm mb-2 md:mb-3">
              Posted by
            </p>sm  mb-2 md:mb-3">
            <Avatar article={article} />

            {articlesRelated.length > 0 && (
              <div className="hidden md:block mt-12">
                <p className=" text-base-content/80 text-sm  mb-2 md:mb-3">cle.slug}>
                  Related reading.5">
                </p>Link
                <div className="space-y-2 md:space-y-5">article.slug}`}
                  {articlesRelated.map((article) => (Name="link link-hover hover:link-primary font-medium"
                    <div className="" key={article.slug}>title={article.title}
                      <p className="mb-0.5">
                        <Link
                          href={`/blog/${article.slug}`}{article.title}
                          className="link link-hover hover:link-primary font-medium"Link>
                          title={article.title} </p>
                          rel="bookmark"<p className="text-base-content/80 max-w-full text-sm">
                        >    {article.description}
                          {article.title}        </p>
                        </Link></div>
                      </p>                  ))}
                      <p className="text-base-content/80 max-w-full text-sm">
                        {article.description}
                      </p>
                    </div>
                  ))}
                </div>TICLE CONTENT */}
              </div>   <section className="w-full max-md:pt-4 md:pr-20 space-y-12 md:space-y-20">
            )}        {article.content}
          </section>         </section>
        </div>










}  );    </>      </article>        </div>          </section>            {article.content}          <section className="w-full max-md:pt-4 md:pr-20 space-y-12 md:space-y-20">          {/* ARTICLE CONTENT */}      </article>
    </>
  );
}
