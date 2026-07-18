import GuideLayout from '@/components/GuideLayout';
import { Link } from 'react-router-dom';

const CANONICAL = 'https://swedenupdate.com/guides/new-in-sweden';
const TITLE = 'New in Sweden: Complete Resource Hub for Expats (2026)';
const DESCRIPTION =
  'New in Sweden? A complete resource hub for expats — jobs, housing, personnummer, healthcare, banking and daily life, updated for 2026.';

const guides = [
  {
    to: '/guides/moving-to-sweden',
    title: 'Moving to Sweden: full expat guide',
    blurb: 'Residency permits, registration, healthcare, banking and daily life — the essentials for your first year.',
  },
  {
    to: '/guides/new-in-sweden/jobs-for-english-speakers',
    title: 'Finding a job in Sweden for English speakers',
    blurb: 'Which industries hire in English, where to search, how to write a Swedish CV, and salary expectations.',
  },
  {
    to: '/guides/new-in-sweden/swedish-rental-market',
    title: 'Understanding the Swedish rental market',
    blurb: 'First-hand vs second-hand contracts, housing queues, deposits, subletting rules and where to actually look.',
  },
  {
    to: '/guides/new-in-sweden/personnummer',
    title: 'Applying for a personnummer',
    blurb: 'Step-by-step: eligibility, documents, Skatteverket booking, timelines and what to do while you wait.',
  },
  {
    to: '/guides/new-in-sweden/learning-swedish-sfi',
    title: 'Learning Swedish & SFI',
    blurb: 'Free SFI courses: eligibility, how to register at your kommun, the four SFI levels, and tips for learning Swedish faster.',
  },
];

const NewInSweden = () => (
  <GuideLayout
    title={TITLE}
    description={DESCRIPTION}
    canonical={CANONICAL}
    keywords="new in sweden, moving to sweden, expats in sweden, life in sweden, personnummer, jobs in sweden english speakers, sweden rental market"
    breadcrumbTrail={[
      { name: 'Home', url: 'https://swedenupdate.com/' },
      { name: 'Guides', url: 'https://swedenupdate.com/guides/new-in-sweden' },
      { name: 'New in Sweden', url: CANONICAL },
    ]}
  >
    <h1 className="text-4xl font-bold mb-4">New in Sweden: A Complete Resource Hub</h1>
    <p className="text-muted-foreground text-lg mb-8">
      Everything expats need to settle into Sweden — from your first residence permit and personnummer
      appointment to landing a job in English and finding a flat that isn't stuck in a 15-year queue.
      Start with the overview below, then dive into the topic guides.
    </p>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Why "new in Sweden" is different</h2>
      <p className="text-muted-foreground leading-relaxed mb-3">
        Sweden runs on digital ID (BankID), a personal identity number (personnummer) and a set of trust-based
        systems that quietly gatekeep almost everything — from signing a phone contract to booking a doctor.
        Getting the first few pieces in place unlocks the rest of daily life, so the order you tackle things
        matters a lot in your first months.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        This hub is written for people arriving in the next 12 months: EU citizens moving for work,
        non-EU professionals on skilled-worker permits, students, and partners joining family. It focuses on
        what is actually different about Sweden rather than generic relocation advice.
      </p>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Guides in this hub</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {guides.map((g) => (
          <Link
            key={g.to}
            to={g.to}
            className="block rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary hover:bg-muted/40"
          >
            <h3 className="text-lg font-semibold text-foreground mb-1">{g.title}</h3>
            <p className="text-sm text-muted-foreground">{g.blurb}</p>
          </Link>
        ))}
      </div>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Your first 90 days: a suggested order</h2>
      <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
        <li>Confirm your residence permit or right of residence before you fly.</li>
        <li>Book a Skatteverket appointment for your personnummer as soon as you have a lease.</li>
        <li>Register for BankID via a Swedish bank (bring passport + personnummer decision).</li>
        <li>Sign up for the municipal housing queue on day one — even if you don't need it yet.</li>
        <li>Register with a vårdcentral (health centre) once your personnummer is active.</li>
        <li>Enrol in free SFI Swedish classes through your kommun.</li>
      </ol>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Stay current on Sweden</h2>
      <p className="text-muted-foreground leading-relaxed">
        Rules, waiting times and housing markets shift often. Follow{' '}
        <Link to="/" className="text-primary hover:underline">Sweden Update</Link> for daily
        Swedish news in English — politics, economy, weather and crime — so you can spot changes that
        affect newcomers as they happen.
      </p>
    </section>
  </GuideLayout>
);

export default NewInSweden;