import GuideLayout from '@/components/GuideLayout';

const CANONICAL = 'https://swedenupdate.com/guides/immigration-policy-updates';
const TITLE = 'Sweden Immigration Policy Changes 2024–2026: What Expats Need to Know';
const DESCRIPTION =
  'Recent and upcoming changes to Swedish immigration law: higher work-permit salary thresholds, stricter permanent residency rules, citizenship reform and what they mean for expats.';

const faq = [
  {
    q: 'What is the new salary threshold for a Swedish work permit?',
    a: 'Since November 2023 the minimum monthly salary for a work permit is 80% of the Swedish median salary (currently around SEK 28,480/month, ~SEK 342,000/year). The government has signalled a further rise toward the full median (~SEK 35,600/month) during 2025–2026, though the exact date depends on ongoing legislation.',
  },
  {
    q: 'How long must I now live in Sweden to get permanent residency?',
    a: 'You still need at least four years of legal residence on a permit that can lead to settlement, but from 2024 you must also show self-sufficiency (stable income), a clean record and, under proposed reforms, basic Swedish and civics knowledge. A tightened permanent-residency law is expected during 2026.',
  },
  {
    q: 'Do the new rules apply to EU citizens?',
    a: 'No. EU/EEA citizens have a right of residence under EU treaties and are not affected by the salary threshold or permanent-residency reform. The changes target non-EU work-permit holders and their families.',
  },
  {
    q: 'What is changing with Swedish citizenship?',
    a: 'A reform expected to enter force in June 2026 will raise the residence requirement from 5 to 8 years, introduce mandatory language and civics tests, require self-sufficiency, and strengthen background checks. Applications submitted before the new law takes effect are decided under the current rules.',
  },
];

const ImmigrationPolicyUpdates = () => (
  <GuideLayout
    title={TITLE}
    description={DESCRIPTION}
    canonical={CANONICAL}
    keywords="sweden immigration, swedish immigration policy, sweden work permit salary threshold, sweden permanent residency, swedish citizenship reform, migrationsverket 2026"
    breadcrumbTrail={[
      { name: 'Home', url: 'https://swedenupdate.com/' },
      { name: 'Guides', url: 'https://swedenupdate.com/guides/new-in-sweden' },
      { name: 'Sweden immigration policy changes', url: CANONICAL },
    ]}
    faq={faq}
  >
    <h1 className="text-4xl font-bold mb-4">Sweden Immigration Policy Changes 2024–2026</h1>
    <p className="text-muted-foreground text-lg mb-8">
      Sweden is in the middle of the biggest overhaul of its immigration rules in a generation. Work-permit
      salary thresholds have jumped, permanent residency is getting harder to keep, and a new citizenship law
      is scheduled for 2026. Here is what expats already in Sweden — or planning to move — need to know.
    </p>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Higher work-permit salary thresholds</h2>
      <p className="text-muted-foreground leading-relaxed mb-3">
        Until October 2023, a non-EU work permit only required a salary of SEK 13,000/month. From
        1 November 2023 the floor jumped to <strong>80% of the Swedish median salary</strong> — around
        SEK 28,480/month (~SEK 342,000/year) at 2025 levels, updated annually by Migrationsverket.
      </p>
      <p className="text-muted-foreground leading-relaxed mb-3">
        The government has proposed raising the threshold to the <strong>full median salary</strong>
        (~SEK 35,600/month), with targeted exemptions for shortage occupations and seasonal workers. The
        exact implementation date is still moving, but expats should plan on it landing at some point in
        2025–2026.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        The threshold applies to <em>new</em> permits and to extensions when your current permit expires. If
        you already hold a permit, your salary must meet the threshold in force at the time you renew.
      </p>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Stricter permanent residency</h2>
      <p className="text-muted-foreground leading-relaxed mb-3">
        Permanent residency (PUT) used to follow almost automatically after four years on a work permit.
        That is no longer the case. Since 2021, applicants must show they can support themselves
        financially. From 2024 onwards, Migrationsverket is applying the self-sufficiency test more
        strictly, and a broader reform is expected during 2026 that adds:
      </p>
      <ul className="list-disc pl-6 text-muted-foreground space-y-2">
        <li>A "respectable lifestyle" requirement (clean criminal record and no debt to Kronofogden)</li>
        <li>Proof of basic Swedish and civics knowledge (in line with the citizenship reform)</li>
        <li>Stable, long-term employment income — not just meeting the salary floor once</li>
        <li>Possible loss of PUT if you leave Sweden for extended periods without notifying Migrationsverket</li>
      </ul>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Citizenship reform: 8 years, tests, June 2026</h2>
      <p className="text-muted-foreground leading-relaxed mb-3">
        A cross-party inquiry has proposed the biggest change to Swedish citizenship law in decades,
        expected to enter force <strong>1 June 2026</strong>. The main elements:
      </p>
      <ul className="list-disc pl-6 text-muted-foreground space-y-2">
        <li>Residence requirement raised from 5 to <strong>8 years</strong> (7 for stateless people and refugees, 5 for Nordic citizens)</li>
        <li>Mandatory <strong>Swedish language test</strong> at roughly B1 level</li>
        <li>Mandatory <strong>civics test</strong> on Swedish society, history and values</li>
        <li>Self-sufficiency requirement — no reliance on social assistance</li>
        <li>Extended background checks by Säpo and the police, with power to revoke citizenship obtained through fraud</li>
      </ul>
      <p className="text-muted-foreground leading-relaxed mt-3">
        Applications filed before the new law takes effect will be decided under the current rules, so
        anyone close to the 5-year mark should check whether they can submit in time.
      </p>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Family reunification and dependants</h2>
      <p className="text-muted-foreground leading-relaxed">
        Family-reunification permits now require the sponsor to meet a stricter maintenance requirement:
        a home of adequate size and standard, plus income sufficient to support the whole household.
        Salary from the higher work-permit threshold is generally enough on its own, but part-time or
        low-income sponsors are increasingly being refused.
      </p>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">What this means in practice</h2>
      <ul className="list-disc pl-6 text-muted-foreground space-y-2">
        <li><strong>New applicants:</strong> negotiate a salary well above the current threshold — ideally at or above the full median — so a future rule change doesn't torpedo your renewal.</li>
        <li><strong>Current permit holders:</strong> keep payslips, tax records and employment contracts for the full permit period; Migrationsverket now audits extensions much more closely.</li>
        <li><strong>Long-term residents:</strong> if you can apply for PUT or citizenship under the current rules, do it sooner rather than later.</li>
        <li><strong>Everyone:</strong> notify Migrationsverket promptly of address, job or family changes — inconsistencies are a common reason for refusals.</li>
      </ul>
    </section>

    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-3">Staying up to date</h2>
      <p className="text-muted-foreground leading-relaxed">
        Immigration rules are changing quickly and often. Always verify current figures directly with
        Migrationsverket (migrationsverket.se) before applying, and follow Sweden Update for daily
        coverage of new legislation, government proposals and Migrationsverket practice.
      </p>
    </section>
  </GuideLayout>
);

export default ImmigrationPolicyUpdates;