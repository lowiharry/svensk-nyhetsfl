import GuideLayout from '@/components/GuideLayout';

const CANONICAL = 'https://swedenupdate.com/guides/new-in-sweden/jobs-for-english-speakers';
const TITLE = 'Finding a Job in Sweden for English Speakers (2026 Guide)';
const DESCRIPTION =
  'How English speakers actually find work in Sweden in 2026 — industries that hire in English, top job boards, Swedish CV tips and salary expectations.';

const faq = [
  {
    q: 'Can I get a job in Sweden without speaking Swedish?',
    a: 'Yes — tech, gaming, life sciences, academia and international headquarters routinely hire in English, especially in Stockholm, Gothenburg, Malmö and Lund. Public sector, healthcare and most customer-facing roles still require working Swedish.',
  },
  {
    q: 'What are the best job boards for English speakers?',
    a: 'LinkedIn is the primary channel. Platform.se, TheHub, Arbetsförmedlingen (Platsbanken), Academic Work, Talenthub and company career pages cover most English-friendly roles. Referrals via meetups and Slack communities still convert best.',
  },
  {
    q: 'What salary should I expect?',
    a: 'Mid-level software engineers in Stockholm typically earn SEK 50,000–75,000/month gross; senior/lead roles reach SEK 80,000–110,000. Life sciences, finance and management consulting pay similarly. Expect ~30% income tax at these bands.',
  },
];

const JobsForEnglishSpeakers = () => (
  <GuideLayout
    title={TITLE}
    description={DESCRIPTION}
    canonical={CANONICAL}
    keywords="jobs in sweden for english speakers, english speaking jobs sweden, work in sweden, sweden tech jobs, sweden salaries"
    breadcrumbTrail={[
      { name: 'Home', url: 'https://swedenupdate.com/' },
      { name: 'New in Sweden', url: 'https://swedenupdate.com/guides/new-in-sweden' },
      { name: 'Jobs for English speakers', url: CANONICAL },
    ]}
    faq={faq}
  >
    <h1 className="text-4xl font-bold mb-4">Finding a Job in Sweden for English Speakers</h1>
    <p className="text-muted-foreground text-lg mb-8">
      Sweden is one of Europe's most English-friendly job markets — if you know where to look and how to
      present yourself. Here is what actually works for expats arriving in 2026.
    </p>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Industries that hire in English</h2>
      <ul className="list-disc pl-6 text-muted-foreground space-y-2">
        <li><strong>Tech & product</strong> — Klarna, Spotify, King, Mojang, Truecaller, iZettle, Voi, Northvolt, and hundreds of scale-ups.</li>
        <li><strong>Life sciences & MedTech</strong> — AstraZeneca, Getinge, Elekta, Recipharm, mostly around Lund, Uppsala and Stockholm.</li>
        <li><strong>Automotive & industrial</strong> — Volvo Cars, Volvo Group, Scania, Ericsson, ABB, Sandvik, SKF.</li>
        <li><strong>Academia & research</strong> — KTH, Karolinska, Chalmers, Lund and Uppsala universities.</li>
        <li><strong>International finance & consulting</strong> — Nordic HQs of McKinsey, BCG, Bain, EQT, Nordea investment banking.</li>
      </ul>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Where to search</h2>
      <p className="text-muted-foreground leading-relaxed mb-3">
        LinkedIn is the primary channel for English-language roles — set your location to Sweden and follow
        target companies. Complement it with these Sweden-specific boards:
      </p>
      <ul className="list-disc pl-6 text-muted-foreground space-y-2">
        <li>Platsbanken (arbetsformedlingen.se) — the national jobs database</li>
        <li>TheHub.io — Nordic startup and scale-up roles</li>
        <li>Academic Work — entry-level and graduate roles</li>
        <li>Jobbland, Monster.se, Indeed.se — general boards</li>
        <li>Company career pages directly (Swedish employers rarely list every role externally)</li>
      </ul>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">How Swedish CVs and interviews differ</h2>
      <p className="text-muted-foreground leading-relaxed mb-3">
        Keep your CV to 1–2 pages, no photo required, and open with a short "profile" paragraph. List
        universities with the country and degree name in English. References are typically requested only
        at final stage.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        Swedish interviews are structured, calm and consensus-driven. Expect 3–5 rounds, competency-based
        questions, a case or take-home task for senior roles, and a strong emphasis on culture fit — team
        interviews are common because most hiring decisions are made collectively.
      </p>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Work permits for non-EU citizens</h2>
      <p className="text-muted-foreground leading-relaxed">
        You need a job offer that meets Migrationsverket's minimum salary threshold before applying for a
        skilled-worker permit. From 2024 the threshold sits at 80% of Sweden's median salary (around
        SEK 28,480/month in 2026, subject to annual updates). Employers must advertise the role in the
        EU/EEA for 10 days and offer terms in line with Swedish collective agreements.
      </p>
    </section>
  </GuideLayout>
);

export default JobsForEnglishSpeakers;