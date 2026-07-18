import GuideLayout from '@/components/GuideLayout';

const CANONICAL = 'https://swedenupdate.com/guides/new-in-sweden/personnummer';
const TITLE = 'How to Apply for a Personnummer in Sweden (2026)';
const DESCRIPTION =
  'Step-by-step guide to applying for a Swedish personnummer in 2026 — eligibility, documents, Skatteverket booking, timelines and what to do while you wait.';

const faq = [
  {
    q: 'Who is eligible for a personnummer?',
    a: 'You are eligible if you plan to live in Sweden for at least 12 months and have the legal right to stay (EU citizen, valid residence permit, or family reunification). Shorter stays qualify for a coordination number (samordningsnummer) instead.',
  },
  {
    q: 'How long does it take to get a personnummer?',
    a: 'Skatteverket typically decides within 4–8 weeks of your in-person visit, though backlogs in Stockholm and Gothenburg can stretch this to 12+ weeks. You cannot legally speed this up — plan around it.',
  },
  {
    q: 'What can I do without a personnummer?',
    a: 'Very little of daily Swedish life works without one: no BankID, no long-term phone contract, no gym membership, no subsidised healthcare, no first-hand lease. Use a coordination number, employer support and cash/foreign cards in the interim.',
  },
];

const Personnummer = () => (
  <GuideLayout
    title={TITLE}
    description={DESCRIPTION}
    canonical={CANONICAL}
    keywords="personnummer sweden, how to get personnummer, skatteverket personnummer, swedish personal identity number, samordningsnummer"
    breadcrumbTrail={[
      { name: 'Home', url: 'https://swedenupdate.com/' },
      { name: 'New in Sweden', url: 'https://swedenupdate.com/guides/new-in-sweden' },
      { name: 'Applying for a personnummer', url: CANONICAL },
    ]}
    faq={faq}
  >
    <h1 className="text-4xl font-bold mb-4">How to Apply for a Personnummer in Sweden</h1>
    <p className="text-muted-foreground text-lg mb-8">
      The personnummer is a 10-digit personal identity number issued by Skatteverket (the Swedish Tax
      Agency). It unlocks BankID, healthcare, banking and long-term housing — and it is the single most
      important admin step in your first months.
    </p>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Are you eligible?</h2>
      <p className="text-muted-foreground leading-relaxed mb-3">
        You can register for a personnummer if you plan to live in Sweden for at least 12 months and have
        the legal right to stay. That covers:
      </p>
      <ul className="list-disc pl-6 text-muted-foreground space-y-2">
        <li>EU/EEA citizens with a right of residence (work, studies, self-sufficiency)</li>
        <li>Non-EU citizens with a valid residence permit from Migrationsverket</li>
        <li>Family members joining a Swedish resident on a family-reunification permit</li>
      </ul>
      <p className="text-muted-foreground leading-relaxed mt-3">
        Shorter stays (under a year) get a <strong>coordination number (samordningsnummer)</strong>
        instead — it works for tax, salary and some services but not BankID or long-term contracts.
      </p>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Documents you need to bring</h2>
      <ul className="list-disc pl-6 text-muted-foreground space-y-2">
        <li>Passport (originals only — Skatteverket does not accept copies)</li>
        <li>Residence-permit card (if non-EU) or evidence of right of residence (if EU)</li>
        <li>Signed rental contract or purchase deed for your Swedish address</li>
        <li>Marriage/birth certificates (apostilled and translated) for family members</li>
        <li>Employment contract or admission letter for the "purpose of stay" section</li>
      </ul>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Step-by-step process</h2>
      <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
        <li>Sign your lease or purchase contract — you need a Swedish address before applying.</li>
        <li>Book an in-person visit at your local Skatteverket office (walk-ins are possible in smaller cities).</li>
        <li>Fill out form SKV 7620 (moving to Sweden from abroad) — available in English on skatteverket.se.</li>
        <li>Attend the appointment with everyone in your household who is also registering.</li>
        <li>Wait for the decision letter (folkbokföringsbevis) by post — 4–8 weeks in most regions.</li>
        <li>Use the personnummer to book a BankID appointment at your bank.</li>
      </ol>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Surviving the wait</h2>
      <p className="text-muted-foreground leading-relaxed">
        Ask your employer to help open a salary account (many banks allow this with just a passport and
        signed contract). Use a foreign card or Revolut for daily payments, keep prescriptions filled
        abroad, and pay full price at healthcare visits — you can claim reimbursement retroactively once
        your personnummer arrives.
      </p>
    </section>
  </GuideLayout>
);

export default Personnummer;