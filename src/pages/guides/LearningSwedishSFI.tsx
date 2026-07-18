import GuideLayout from '@/components/GuideLayout';

const CANONICAL = 'https://swedenupdate.com/guides/new-in-sweden/learning-swedish-sfi';
const TITLE = 'Learning Swedish & SFI: A Beginner’s Guide for Newcomers (2026)';
const DESCRIPTION =
  'SFI — Swedish for Immigrants — is free for most newcomers. Learn eligibility, how to register at your kommun, course levels, study tips and what to expect after SFI.';

const faq = [
  {
    q: 'Who is eligible for free SFI?',
    a: 'Most adults who lack basic Swedish and have a personal identity number (personnummer) or are registered in Sweden as EU/EEA citizens can take SFI for free. Some kommuner also accept people with a coordination number (samordningsnummer) or asylum seekers who have received a residence permit.',
  },
  {
    q: 'How do I register for SFI?',
    a: 'Contact your local kommun’s adult education centre (vuxenutbildningen) or visit the national Studera.nu/Studieinfo portal. You will usually need your personnummer, proof of residence, and a short placement test.',
  },
  {
    q: 'What do SFI courses A, B, C and D mean?',
    a: 'SFI has four levels: A for beginners with little or no schooling; B for beginners who can read and write; C intermediate; and D upper-intermediate. Completing SFI D is often required before moving on to Swedish as a second language (Svenska som andraspråk) courses.',
  },
  {
    q: 'Can I learn Swedish without SFI?',
    a: 'Yes — many people supplement SFI with apps like Duolingo, Babbel, or Rivstart, Swedish TV with subtitles, and language cafés (språkcafé). But SFI is free, structured, and helps you reach a level that opens vocational and academic Swedish courses.',
  },
];

const LearningSwedishSFI = () => (
  <GuideLayout
    title={TITLE}
    description={DESCRIPTION}
    canonical={CANONICAL}
    keywords="learn swedish sfi, svenska för invandrare, swedish for immigrants, sfi courses, sfi levels, kommun sfi, study swedish sweden"
    breadcrumbTrail={[
      { name: 'Home', url: 'https://swedenupdate.com/' },
      { name: 'New in Sweden', url: 'https://swedenupdate.com/guides/new-in-sweden' },
      { name: 'Learning Swedish & SFI', url: CANONICAL },
    ]}
    faq={faq}
  >
    <h1 className="text-4xl font-bold mb-4">Learning Swedish & SFI: A Beginner’s Guide</h1>
    <p className="text-muted-foreground text-lg mb-8">
      SFI — Svenska för invandrare — is the Swedish government’s free language programme for newcomers.
      Whether you need Swedish for work, study or everyday life, SFI is the most practical place to start.
    </p>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">What SFI is and why it matters</h2>
      <p className="text-muted-foreground leading-relaxed mb-3">
        SFI is designed to give adult immigrants enough Swedish to handle daily life, work, and further study.
        It is free of charge for eligible residents, and many municipalities run daytime, evening and online classes.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        Beyond SFI, Sweden has a clear pathway: SFI → Swedish as a second language (SAS) courses → Swedish at a level
        that meets university or vocational requirements. Completing SFI is often a prerequisite for the next step.
      </p>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Eligibility: who can take SFI?</h2>
      <ul className="list-disc pl-6 text-muted-foreground space-y-2">
        <li>Adults (16+) who have a Swedish personal identity number (personnummer).</li>
        <li>EU/EEA citizens registered in Sweden, even before a full personnummer is issued.</li>
        <li>People with a coordination number (samordningsnummer) in some municipalities.</li>
        <li>Refugees and asylum seekers who have received a residence permit.</li>
        <li>You do not need a permanent residence permit — many temporary residents qualify.</li>
      </ul>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">How to register at your kommun</h2>
      <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
        <li>Find your municipality’s adult education page (search “[kommun] vuxenutbildning SFI”).</li>
        <li>Submit an online application or visit the studievägledare (study counsellor) in person.</li>
        <li>Bring ID, proof of residence, and your personnummer or coordination number.</li>
        <li>Take a placement test to decide which SFI level suits you.</li>
        <li>Choose a study pace: slow, regular, fast track, or distance.</li>
      </ol>
      <p className="text-muted-foreground leading-relaxed mt-3">
        Waiting times vary by city. Stockholm, Gothenburg and Malmö can be busy, so apply as soon as you have a
        registered address. Smaller kommuner often have shorter queues.
      </p>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">The four SFI levels</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-muted-foreground border border-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 font-semibold">Level</th>
              <th className="px-4 py-2 font-semibold">Who it is for</th>
              <th className="px-4 py-2 font-semibold">Goal</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td className="px-4 py-2 font-medium">SFI A</td>
              <td className="px-4 py-2">Beginners with little or no formal schooling.</td>
              <td className="px-4 py-2">Basic literacy and everyday phrases.</td>
            </tr>
            <tr className="border-t border-border">
              <td className="px-4 py-2 font-medium">SFI B</td>
              <td className="px-4 py-2">Beginners who can read and write.</td>
              <td className="px-4 py-2">Simple conversations and practical Swedish.</td>
            </tr>
            <tr className="border-t border-border">
              <td className="px-4 py-2 font-medium">SFI C</td>
              <td className="px-4 py-2">Intermediate learners.</td>
              <td className="px-4 py-2">Stronger reading, writing and speaking skills.</td>
            </tr>
            <tr className="border-t border-border">
              <td className="px-4 py-2 font-medium">SFI D</td>
              <td className="px-4 py-2">Upper-intermediate learners.</td>
              <td className="px-4 py-2">Foundation for Swedish as a second language (SAS) courses.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Study tips that actually help</h2>
      <ul className="list-disc pl-6 text-muted-foreground space-y-2">
        <li><strong>Watch Swedish TV with Swedish subtitles</strong> — SVT Play and Swedish Netflix are free or cheap sources.</li>
        <li><strong>Go to språkcafé</strong> — language cafés run by libraries and municipalities are free and low-pressure.</li>
        <li><strong>Practice every errand in Swedish</strong> — grocery shops, pharmacies, and Systembolaget are great classrooms.</li>
        <li><strong>Use apps consistently</strong> — Duolingo, Babbel, and Rivstart build vocabulary, but pair them with speaking practice.</li>
        <li><strong>Read 8 Sidor</strong> — news in easy Swedish, ideal for SFI B/C/D levels.</li>
      </ul>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">After SFI: what comes next?</h2>
      <p className="text-muted-foreground leading-relaxed mb-3">
        Once you finish SFI D, you can move on to Swedish as a second language (SAS) courses, often called SAS A, B, C and D.
        SAS D is the level usually required for university studies in Swedish.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        For work, many employers accept SFI D plus workplace Swedish training. Some trades and professions require
        Swedish at a SAS level or a specific vocational Swedish exam (yrkessvenska).
      </p>
    </section>
  </GuideLayout>
);

export default LearningSwedishSFI;
