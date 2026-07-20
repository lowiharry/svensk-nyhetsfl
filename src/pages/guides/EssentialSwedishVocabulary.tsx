import GuideLayout from '@/components/GuideLayout';
import { Link } from 'react-router-dom';

const CANONICAL = 'https://swedenupdate.com/guides/new-in-sweden/essential-swedish-vocabulary';
const TITLE = 'Essential Swedish Vocabulary for Expats (2026)';
const DESCRIPTION =
  'Key Swedish words every expat needs: fika, personnummer, skatt, sambo, lagom, vårdcentral, and more. Pronunciation tips, cultural context, and where you will hear each term.';

const faq = [
  {
    q: 'What does fika mean?',
    a: 'Fika is both a noun and a verb: a coffee break, usually with a pastry (kanelbulle), and a social ritual. It is not just "coffee" — it is a pause in the day that Swedes treat as almost sacred.',
  },
  {
    q: 'What is a personnummer?',
    a: 'Your Swedish personal identity number. It is 10 digits (YYYYMMDD-XXXX) and unlocks BankID, healthcare, banking, and long-term contracts. Read the full guide: /guides/new-in-sweden/personnummer.',
  },
  {
    q: 'What does skatt mean?',
    a: 'Skatt means tax. In Sweden, income tax is deducted automatically from your salary (PAYE) and you file an annual tax return (inkomstdeklaration) with Skatteverket.',
  },
  {
    q: 'What is a sambo?',
    a: 'A sambo is a cohabiting partner ("samboende"). Sweden legally recognises unmarried couples who live together, and sambofördelning covers how property is split if you separate.',
  },
  {
    q: 'What does lagom mean?',
    a: 'Lagom translates roughly as "just the right amount" or "not too much, not too little." It is a cultural ideal of moderation, fairness, and not standing out.',
  },
];

const vocabulary = [
  {
    term: 'Fika',
    pronunciation: 'FEE-kah',
    meaning: 'A coffee-and-cake break, or to take one.',
    context: 'Used in offices, homes, and even government meetings. Accept the invite — it is a relationship builder.',
    category: 'Daily life',
  },
  {
    term: 'Personnummer',
    pronunciation: 'PER-sohn-noom-er',
    meaning: 'Personal identity number (YYYYMMDD-XXXX).',
    context: 'You need it for BankID, phone contracts, healthcare, and most long-term housing.',
    category: 'Bureaucracy',
  },
  {
    term: 'Skatt',
    pronunciation: 'skaht',
    meaning: 'Tax.',
    context: 'Income tax is paid through your employer; Skatteverket is the tax authority.',
    category: 'Money',
  },
  {
    term: 'Sambo',
    pronunciation: 'SAHM-boo',
    meaning: 'Cohabiting partner.',
    context: 'Unmarried couples who live together have legal protections similar to spouses in some areas.',
    category: 'Relationships',
  },
  {
    term: 'Lagom',
    pronunciation: 'LAH-gom',
    meaning: 'Just the right amount; moderate.',
    context: 'A core cultural value — avoiding excess, boasting, or extreme behaviour.',
    category: 'Culture',
  },
  {
    term: 'Vårdcentral',
    pronunciation: 'VOHRD-sen-trahl',
    meaning: 'Local health centre / GP clinic.',
    context: 'Register with one as soon as you have a personnummer for non-emergency care.',
    category: 'Healthcare',
  },
  {
    term: 'BankID',
    pronunciation: 'bank-ee-dee',
    meaning: 'Sweden’s digital ID app.',
    context: 'Used to log in to banks, healthcare, government services, and even some online shops.',
    category: 'Digital life',
  },
  {
    term: 'Swish',
    pronunciation: 'swish',
    meaning: 'Mobile payment app linked to your phone number.',
    context: 'Swedes use Swish for everything from splitting restaurant bills to buying second-hand items.',
    category: 'Money',
  },
  {
    term: 'Kommun',
    pronunciation: 'kohm-MOON',
    meaning: 'Municipality.',
    context: 'Runs local services: schools, SFI, housing queues, and elderly care.',
    category: 'Bureaucracy',
  },
  {
    term: 'Förskola',
    pronunciation: 'FEUR-skoh-lah',
    meaning: 'Preschool / daycare.',
    context: 'Municipal preschool is heavily subsidised once you have a personal identity number.',
    category: 'Family',
  },
  {
    term: 'Kanelbulle',
    pronunciation: 'kah-nel-BUHL-leh',
    meaning: 'Cinnamon bun.',
    context: 'The classic fika pastry. Look for it on 4 October, Sweden’s Kanelbullens dag.',
    category: 'Food',
  },
  {
    term: 'Mysig',
    pronunciation: 'MEE-sig',
    meaning: 'Cosy.',
    context: 'Swedes prize mys — candles, blankets, warm drinks, and low lighting in winter.',
    category: 'Culture',
  },
  {
    term: 'Allemansrätten',
    pronunciation: 'ah-leh-mahns-REH-ten',
    meaning: 'The right of public access.',
    context: 'Lets you walk, camp, and pick berries on private land, provided you respect nature and landowners.',
    category: 'Nature',
  },
  {
    term: 'Skog',
    pronunciation: 'skohg',
    meaning: 'Forest.',
    context: 'Sweden is roughly 70% forest. Skog is central to weekend life, berry picking, and mental health.',
    category: 'Nature',
  },
  {
    term: 'Öl',
    pronunciation: 'url',
    meaning: 'Beer.',
    context: 'Systembolaget sells alcohol over 3.5% ABV; weaker beer is sold in supermarkets.',
    category: 'Food & drink',
  },
  {
    term: 'Systembolaget',
    pronunciation: 'sis-tem-boh-lah-GET',
    meaning: 'State-run alcohol retailer.',
    context: 'Most wine and spirits are only sold here. Closed on Sundays and public holidays.',
    category: 'Food & drink',
  },
  {
    term: 'Trevligt',
    pronunciation: 'TREHV-leeht',
    meaning: 'Nice / pleasant.',
    context: 'A polite, all-purpose response to a good experience, meeting, or meal.',
    category: 'Social',
  },
  {
    term: 'Utegym',
    pronunciation: 'OO-teh-jim',
    meaning: 'Outdoor gym.',
    context: 'Free public fitness stations in parks. Very common in summer and year-round in milder areas.',
    category: 'Lifestyle',
  },
  {
    term: 'Semester',
    pronunciation: 'seh-MEH-ster',
    meaning: 'Holiday / vacation.',
    context: 'Swedes take most of their annual leave in July; many offices close or slow down.',
    category: 'Work',
  },
  {
    term: 'Tack',
    pronunciation: 'tahk',
    meaning: 'Thanks.',
    context: 'Use it constantly. "Tack så mycket" = thank you very much.',
    category: 'Social',
  },
];

const EssentialSwedishVocabulary = () => (
  <GuideLayout
    title={TITLE}
    description={DESCRIPTION}
    canonical={CANONICAL}
    keywords="swedish vocabulary, swedish words for expats, learn swedish basics, fika meaning, lagom meaning, personnummer, skatt, sambo, moving to sweden"
    breadcrumbTrail={[
      { name: 'Home', url: 'https://swedenupdate.com/' },
      { name: 'New in Sweden', url: 'https://swedenupdate.com/guides/new-in-sweden' },
      { name: 'Essential Swedish vocabulary', url: CANONICAL },
    ]}
    faq={faq}
  >
    <h1 className="text-4xl font-bold mb-4">Essential Swedish Vocabulary for Expats</h1>
    <p className="text-muted-foreground text-lg mb-8">
      Moving to Sweden means learning more than grammar. You will hear these words in Skatteverket queues,
      at after-work fikas, on apartment adverts, and in the supermarket aisle. This glossary covers the
      terms that unlock everyday life, plus the cultural context that makes them meaningful.
    </p>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Why these words matter</h2>
      <p className="text-muted-foreground leading-relaxed mb-3">
        Most official information in Sweden is available in English, but daily life happens in Swedish.
        Knowing key vocabulary helps you read rental contracts, understand payslips, follow local news,
        and join conversations at work. It also makes the difference between feeling like a tourist and
        feeling like a resident.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        We have grouped the terms by situation — bureaucracy, money, social life, food, and culture — so
        you can learn what you need before it comes up.
      </p>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Quick-reference glossary</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {vocabulary.map((v) => (
          <div
            key={v.term}
            className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary hover:bg-muted/40"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground">{v.term}</h3>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{v.category}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              <span className="font-medium text-foreground">Pronunciation:</span> {v.pronunciation}
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              <span className="font-medium text-foreground">Meaning:</span> {v.meaning}
            </p>
            <p className="text-sm text-muted-foreground">{v.context}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Cultural context: fika, lagom, and mys</h2>
      <p className="text-muted-foreground leading-relaxed mb-3">
        <strong>Fika</strong> is not just coffee. It is a social pause built into the working day. Refusing it
        can seem standoffish; accepting it is one of the fastest ways to build rapport with colleagues.
      </p>
      <p className="text-muted-foreground leading-relaxed mb-3">
        <strong>Lagom</strong> is harder to translate. It means "just enough" and it shapes everything from
        portion sizes to workplace behaviour. Standing out too much — either by boasting or by complaining —
        tends to feel un-Swedish.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        <strong>Mys</strong> is the art of cosiness. In long, dark winters, candles, blankets, and warm drinks
        become a kind of national therapy. You will hear Swedes say "mysigt" about cafes, apartments, and
        quiet Friday nights at home.
      </p>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Bureaucracy and money terms</h2>
      <p className="text-muted-foreground leading-relaxed mb-3">
        A few words unlock the admin side of Sweden. Your <strong>personnummer</strong> is the key to almost
        everything, and you will use <strong>BankID</strong> to prove who you are online. <strong>Skatt</strong> is
        deducted from salary automatically, but you still need to file a return with Skatteverket each year.
      </p>
      <p className="text-muted-foreground leading-relaxed mb-3">
        <strong>Swish</strong> is the mobile payment app Swedes use for everything from splitting bills to
        buying furniture on Blocket. It is linked to your phone number and bank account, and most people
        expect you to have it.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        Your <strong>kommun</strong> handles local services: registering for SFI, preschool queues, housing
        queues, and some healthcare. If you are unsure which authority to contact, start with the kommun’s
        website.
      </p>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Where to learn more</h2>
      <p className="text-muted-foreground leading-relaxed mb-3">
        For structured Swedish lessons, see our guide to{' '}
        <Link to="/guides/new-in-sweden/learning-swedish-sfi" className="text-primary hover:underline">
          Learning Swedish & SFI
        </Link>
        . For the first admin steps, read the{' '}
        <Link to="/guides/new-in-sweden/personnummer" className="text-primary hover:underline">
          personnummer guide
        </Link>
        {' '}and the{' '}
        <Link to="/guides/moving-to-sweden" className="text-primary hover:underline">
          Moving to Sweden overview
        </Link>.
      </p>
    </section>
  </GuideLayout>
);

export default EssentialSwedishVocabulary;
