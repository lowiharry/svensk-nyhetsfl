import GuideLayout from '@/components/GuideLayout';

const CANONICAL = 'https://swedenupdate.com/guides/new-in-sweden/swedish-rental-market';
const TITLE = 'Understanding the Swedish Rental Market (2026 Guide)';
const DESCRIPTION =
  'How the Swedish rental market really works in 2026 — first-hand vs second-hand contracts, housing queues, deposits, sublet rules and where to find flats.';

const faq = [
  {
    q: 'What is the difference between first-hand and second-hand contracts?',
    a: 'A first-hand (förstahand) contract is signed directly with the landlord and is indefinite with rent-controlled prices — but usually requires years in a housing queue. A second-hand (andrahand) contract is a sublet from someone who already holds a first-hand contract or owns the flat; it is time-limited and priced closer to market rates.',
  },
  {
    q: 'How long is the Stockholm housing queue?',
    a: 'Bostadsförmedlingen queue times for a first-hand flat in central Stockholm are commonly 10–20 years; suburbs range from 4–10 years. Registering for the queue costs a small annual fee and you accumulate queue days from day one, so sign up as soon as you arrive.',
  },
  {
    q: 'Is Airbnb legal for long-term stays in Sweden?',
    a: 'Airbnb is legal but most tenant-owned (bostadsrätt) associations restrict short-term letting, and rental (hyresrätt) contracts require landlord and often Hyresnämnden approval for any sublet longer than a few weeks. Long-term Airbnb use is risky for both parties.',
  },
];

const SwedishRentalMarket = () => (
  <GuideLayout
    title={TITLE}
    description={DESCRIPTION}
    canonical={CANONICAL}
    keywords="swedish rental market, renting in sweden, first hand contract sweden, second hand contract sweden, andrahand, bostadsko, stockholm housing"
    breadcrumbTrail={[
      { name: 'Home', url: 'https://swedenupdate.com/' },
      { name: 'New in Sweden', url: 'https://swedenupdate.com/guides/new-in-sweden' },
      { name: 'Swedish rental market', url: CANONICAL },
    ]}
    faq={faq}
  >
    <h1 className="text-4xl font-bold mb-4">Understanding the Swedish Rental Market</h1>
    <p className="text-muted-foreground text-lg mb-8">
      Sweden's rental market is famously tough, but it is also predictable once you understand the two
      parallel systems — the queue-based rent-controlled market, and the fast-moving sublet market.
    </p>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">First-hand vs second-hand contracts</h2>
      <p className="text-muted-foreground leading-relaxed mb-3">
        <strong>First-hand (förstahandskontrakt)</strong> — signed directly with the landlord, indefinite,
        and priced through collective negotiation, which keeps rents well below market. Almost all
        first-hand rental flats in the big cities are allocated through municipal housing queues.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        <strong>Second-hand (andrahand)</strong> — a legal sublet from someone who holds the first-hand
        contract or owns the flat. Contracts run 3–12 months (occasionally longer with Hyresnämnden
        approval), require the primary landlord's consent, and are priced 20–80% above equivalent
        first-hand rents depending on the city.
      </p>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Housing queues (bostadskö) by city</h2>
      <ul className="list-disc pl-6 text-muted-foreground space-y-2">
        <li><strong>Stockholm</strong> — Bostadsförmedlingen (~SEK 250/year). 10–20 years for central Stockholm; 4–10 years for suburbs.</li>
        <li><strong>Gothenburg</strong> — Boplats Göteborg. 5–12 years for central areas.</li>
        <li><strong>Malmö</strong> — Boplats Syd. 1–7 years — the most accessible major market.</li>
        <li><strong>Uppsala & Lund</strong> — student housing foundations (Uppsala Studentbostäder, AF Bostäder) have separate, much shorter queues.</li>
      </ul>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Where to find a flat right now</h2>
      <ul className="list-disc pl-6 text-muted-foreground space-y-2">
        <li>Blocket Bostad — the biggest second-hand marketplace</li>
        <li>Qasa and Samtrygg — vetted sublets with deposit protection</li>
        <li>Bostad Direkt and Andrahand.se — traditional agencies</li>
        <li>Facebook groups like "Bostad Stockholm" (watch out for scams)</li>
        <li>Hemnet — for buying a bostadsrätt (tenant-owner apartment)</li>
      </ul>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Deposits, fees and scam red flags</h2>
      <p className="text-muted-foreground leading-relaxed mb-3">
        Legitimate landlords typically ask for 1–3 months' rent as deposit and never ask for payment
        before you have viewed the flat and signed a contract. Any listing that asks for a wire transfer
        before a viewing, refuses video calls, or advertises a central Stockholm flat far below market is
        almost certainly a scam.
      </p>
    </section>
  </GuideLayout>
);

export default SwedishRentalMarket;