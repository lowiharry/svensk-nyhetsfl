import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CANONICAL = 'https://swedenupdate.com/guides/moving-to-sweden';
const TITLE = 'Moving to Sweden: New in Sweden Guide for Expats 2026';
const DESCRIPTION =
  'New in Sweden? Practical guide for expats moving to Sweden — residency permits, personnummer, housing, healthcare, banking, taxes and jobs.';

const MovingToSweden = () => {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://swedenupdate.com/' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://swedenupdate.com/guides/moving-to-sweden' },
      { '@type': 'ListItem', position: 3, name: 'Moving to Sweden', item: CANONICAL },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: TITLE,
    description: DESCRIPTION,
    image: 'https://swedenupdate.com/og-image.jpg',
    author: { '@type': 'Organization', name: 'Sweden Update' },
    publisher: {
      '@type': 'Organization',
      name: 'Sweden Update',
      logo: { '@type': 'ImageObject', url: 'https://swedenupdate.com/favicon.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': CANONICAL },
    inLanguage: 'en',
    articleSection: 'Guides',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do I need a visa to move to Sweden?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'EU/EEA citizens can move to Sweden freely. Non-EU citizens generally need a residence permit from Migrationsverket before arriving — commonly a work, study, family reunification or self-employment permit.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a personnummer and how do I get one?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A personnummer is your Swedish personal identity number, issued by Skatteverket (the Tax Agency) once you register as a resident. You typically need it before opening a bank account, signing a housing contract or accessing subsidised healthcare.',
        },
      },
      {
        '@type': 'Question',
        name: 'How hard is it to find housing in Sweden?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'First-hand rental contracts in Stockholm, Gothenburg and Malmö have long queues (often 5–20 years). Most newcomers start with a second-hand (andrahand) contract, a corporate rental or student housing while queuing for a first-hand contract.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does healthcare work in Sweden?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sweden has universal, largely tax-funded healthcare run by the regions. Residents pay a small patient fee per visit up to an annual cap. Register with a vårdcentral (health centre) after you get your personnummer.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta
          name="keywords"
          content="moving to Sweden, new in Sweden, expats in Sweden, Sweden residency permit, personnummer, housing in Sweden, healthcare in Sweden, work in Sweden, living in Sweden"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:image" content="https://swedenupdate.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content="https://swedenupdate.com/og-image.jpg" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" aria-label="Back to home" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-4">Moving to Sweden: A Practical Guide for Expats</h1>
          <p className="text-muted-foreground text-lg mb-8">
            New in Sweden? This guide walks through the essentials — residency, housing, healthcare,
            banking, taxes and daily life — so you can get set up quickly and focus on settling in.
          </p>

          <div className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm text-foreground">
              <strong>Part of the </strong>
              <Link to="/guides/new-in-sweden" className="text-primary font-semibold hover:underline">
                New in Sweden resource hub
              </Link>
              <strong> — dedicated deep-dives on </strong>
              <Link to="/guides/new-in-sweden/jobs-for-english-speakers" className="text-primary hover:underline">jobs for English speakers</Link>
              <strong>, </strong>
              <Link to="/guides/new-in-sweden/swedish-rental-market" className="text-primary hover:underline">the Swedish rental market</Link>
              <strong>, and </strong>
              <Link to="/guides/new-in-sweden/personnummer" className="text-primary hover:underline">applying for a personnummer</Link>
              <strong>.</strong>
            </p>
          </div>

          <nav aria-label="On this page" className="mb-10 rounded-lg border border-border bg-muted/40 p-4">
            <h2 className="text-lg font-semibold mb-2">On this page</h2>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li><a href="#residency" className="text-primary hover:underline">Residency and visas</a></li>
              <li><a href="#personnummer" className="text-primary hover:underline">Personnummer and registration</a></li>
              <li><a href="#housing" className="text-primary hover:underline">Finding housing</a></li>
              <li><a href="#healthcare" className="text-primary hover:underline">Healthcare</a></li>
              <li><a href="#banking" className="text-primary hover:underline">Banking, BankID and taxes</a></li>
              <li><a href="#work" className="text-primary hover:underline">Working and language</a></li>
              <li><a href="#daily-life" className="text-primary hover:underline">Daily life and culture</a></li>
              <li><a href="#faq" className="text-primary hover:underline">FAQ</a></li>
            </ul>
          </nav>

          <section id="residency" className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Residency and visas</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              EU and EEA citizens can move to Sweden without a visa and start working straight away.
              Non-EU citizens usually need a residence permit from{' '}
              <a
                href="https://www.migrationsverket.se/English.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Migrationsverket
              </a>{' '}
              before travelling. Common routes include work permits, study permits, family
              reunification and self-employment permits.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Apply early — processing times vary widely by permit type and nationality — and gather
              your passport, employment contract or admission letter, and proof of accommodation and
              funds before you start.
            </p>
          </section>

          <section id="personnummer" className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Personnummer and registration</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you plan to stay in Sweden for a year or more, register with{' '}
              <a
                href="https://www.skatteverket.se/servicelankar/otherlanguages/inenglish.4.12815e4f14a62bc048f4edc.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Skatteverket
              </a>{' '}
              (the Swedish Tax Agency) to receive a personnummer. This 10-digit personal identity
              number unlocks most of Swedish life: subsidised healthcare, a Swedish bank account,
              BankID, phone contracts, gym memberships and long-term rental contracts. Shorter stays
              can apply for a coordination number (samordningsnummer) instead.
            </p>
          </section>

          <section id="housing" className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Finding housing in Sweden</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Housing is the hardest part of moving to Sweden's big cities. First-hand rental
              contracts (förstahandskontrakt) in Stockholm, Gothenburg and Malmö are allocated
              through municipal queues that can take 5–20 years, so most newcomers start with:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-3">
              <li>Second-hand contracts (andrahand) via Blocket Bostad, Qasa or Samtrygg</li>
              <li>Corporate rentals or serviced apartments arranged by your employer</li>
              <li>Student housing through the local university's housing foundation</li>
              <li>Buying a bostadsrätt (tenant-owner apartment) via Hemnet</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Register with the housing queue (bostadskö) in your city on day one, even if you don't
              need a flat yet — the queue time is the currency that eventually gets you a first-hand
              contract.
            </p>
          </section>

          <section id="healthcare" className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Healthcare</h2>
            <p className="text-muted-foreground leading-relaxed">
              Sweden runs a universal, largely tax-funded healthcare system through its regions.
              Once you have a personnummer, register with a local vårdcentral (health centre) — it
              becomes your first point of contact for non-emergency care. Patient fees are small and
              capped annually (högkostnadsskydd). For urgent but non-life-threatening issues, call
              1177 for triage; call 112 for emergencies.
            </p>
          </section>

          <section id="banking" className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Banking, BankID and taxes</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              A Swedish bank account and BankID are essential — BankID is the national digital ID
              used to log in to almost every service, from Skatteverket to Swish (mobile payments).
              Major banks include Swedbank, Handelsbanken, SEB and Nordea; expect to bring your
              passport, personnummer and proof of address or employment.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Sweden's income tax is progressive and administered by Skatteverket. Employers deduct
              tax at source, and most residents file a pre-filled declaration once a year in spring.
            </p>
          </section>

          <section id="work" className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Working and language</h2>
            <p className="text-muted-foreground leading-relaxed">
              English is widely spoken, especially in tech, academia and Stockholm's international
              companies, so you can start working without Swedish. Learning Swedish is still the
              fastest way to unlock friendships, public-sector jobs and local news — sign up for the
              free SFI (Svenska för invandrare) course through your kommun once you're registered.
            </p>
          </section>

          <section id="daily-life" className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Daily life and culture</h2>
            <p className="text-muted-foreground leading-relaxed">
              Expect long, dark winters balanced by bright summers, a strong outdoor culture
              (allemansrätten lets you roam most nature freely), fika breaks that structure the work
              day, and a society that leans on trust, consensus and digital-first services. Following
              Swedish news — politics, weather, economy and crime — is the fastest way to plug into
              conversations at work and with neighbours.
            </p>
          </section>

          <section id="faq" className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Frequently asked questions</h2>

            <h3 className="text-xl font-semibold mt-6 mb-2">Do I need a visa to move to Sweden?</h3>
            <p className="text-muted-foreground leading-relaxed">
              EU/EEA citizens can move freely. Non-EU citizens generally need a residence permit
              from Migrationsverket before arriving — most often a work, study, family or
              self-employment permit.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">How long does it take to get a personnummer?</h3>
            <p className="text-muted-foreground leading-relaxed">
              Processing at Skatteverket typically takes a few weeks after you register in person,
              but can take longer during busy periods. Bring your passport, residence-permit card
              and proof of address to the appointment.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">Is Sweden expensive for expats?</h3>
            <p className="text-muted-foreground leading-relaxed">
              Sweden is mid-to-high cost by European standards. Housing and eating out are the
              biggest line items; groceries, public transport and healthcare are more affordable
              than many newcomers expect.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">Where can I follow Swedish news in English?</h3>
            <p className="text-muted-foreground leading-relaxed">
              Sweden Update aggregates breaking news, politics, economy, weather and crime from major
              Swedish outlets — a good daily read while you settle in. Head back to the{' '}
              <Link to="/" className="text-primary hover:underline">
                homepage
              </Link>{' '}
              for the latest headlines.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default MovingToSweden;