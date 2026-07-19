import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

interface GuideLayoutProps {
  title: string;
  description: string;
  canonical: string;
  breadcrumbTrail: Array<{ name: string; url: string }>;
  keywords?: string;
  faq?: Array<{ q: string; a: string }>;
  children: ReactNode;
}

const OG_IMAGE = 'https://swedenupdate.com/og-image.jpg';

const GuideLayout = ({
  title,
  description,
  canonical,
  breadcrumbTrail,
  keywords,
  faq,
  children,
}: GuideLayoutProps) => {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbTrail.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.name,
      item: b.url,
    })),
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: OG_IMAGE,
    author: { '@type': 'Organization', name: 'Sweden Update' },
    publisher: {
      '@type': 'Organization',
      name: 'Sweden Update',
      logo: { '@type': 'ImageObject', url: 'https://swedenupdate.com/favicon.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    inLanguage: 'en',
    articleSection: 'Guides',
  };

  const faqSchema = faq && faq.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords} />}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        {faqSchema && (
          <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        )}
      </Helmet>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-4 flex flex-wrap gap-2">
          <Link to="/">
            <Button variant="ghost" size="sm" aria-label="Back to home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link to="/guides/new-in-sweden">
            <Button variant="ghost" size="sm" aria-label="Back to New in Sweden hub">
              New in Sweden hub
            </Button>
          </Link>
        </div>

        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            {breadcrumbTrail.map((b, i) => (
              <li key={b.url} className="flex items-center gap-1">
                {i > 0 && <span aria-hidden>/</span>}
                {i === breadcrumbTrail.length - 1 ? (
                  <span aria-current="page" className="text-foreground">
                    {b.name}
                  </span>
                ) : (
                  <Link to={b.url.replace('https://swedenupdate.com', '')} className="hover:text-primary">
                    {b.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          {children}
        </article>

        <aside className="mt-12 rounded-lg border border-border bg-muted/40 p-6">
          <h2 className="text-lg font-semibold mb-3">More in the New in Sweden hub</h2>
          <ul className="space-y-2 text-sm">
            <li><Link to="/guides/new-in-sweden" className="text-primary hover:underline">Overview: New in Sweden</Link></li>
            <li><Link to="/guides/moving-to-sweden" className="text-primary hover:underline">Moving to Sweden: full expat guide</Link></li>
            <li><Link to="/guides/new-in-sweden/jobs-for-english-speakers" className="text-primary hover:underline">Finding a job in Sweden for English speakers</Link></li>
            <li><Link to="/guides/new-in-sweden/swedish-rental-market" className="text-primary hover:underline">Understanding the Swedish rental market</Link></li>
            <li><Link to="/guides/new-in-sweden/personnummer" className="text-primary hover:underline">Applying for a personnummer</Link></li>
            <li><Link to="/guides/new-in-sweden/learning-swedish-sfi" className="text-primary hover:underline">Learning Swedish & SFI</Link></li>
            <li><Link to="/guides/aftonbladet-vs-expressen" className="text-primary hover:underline">Aftonbladet vs Expressen in English</Link></li>
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default GuideLayout;