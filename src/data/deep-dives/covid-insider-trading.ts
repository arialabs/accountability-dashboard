import type { DeepDiveInvestigation } from "@/lib/types";

export const covidInsiderTrading: DeepDiveInvestigation = {
  id: "covid-insider-trading",
  slug: "covid-insider-trading",
  title: "Sold Before the Crash",
  subtitle: "How Senators Dumped Stocks After Secret COVID Briefings",
  description: "In January and February 2020, senior U.S. senators received classified intelligence briefings about the coming pandemic — then quietly sold millions in stock before markets collapsed. An investigation into one of the most brazen examples of congressional insider trading in history.",
  publishedDate: "2026-03-10",
  readTimeMinutes: 10,
  tags: ["COVID-19", "Insider Trading", "STOCK Act", "Senate", "Public Health"],

  summary: `In late January 2020, the Senate Intelligence Committee held a classified briefing on the emerging COVID-19 threat. What senators heard was sobering: a pandemic of potentially catastrophic scale was coming. The stock market had not yet priced this in.

Within days of that briefing, at least four senators executed stock sales totaling millions of dollars — offloading shares in hotels, airlines, and other sectors that would be devastated by the pandemic. The market crashed 30% in the weeks that followed. The senators had sold near the top.

The trades prompted FBI investigations, Department of Justice reviews, and widespread public outrage. Three of the four cases were ultimately closed without charges. The fourth — Senator Richard Burr — remained under scrutiny the longest before charges were also dropped. No senator was ever held accountable.

This is the story of what happened, who did it, and why the STOCK Act failed to prevent it.`,

  keyFindings: [
    "At least 4 senators sold significant stock holdings days after a classified COVID-19 intelligence briefing in January 2020",
    "Senator Richard Burr (R-NC) sold between $628,000 and $1.72 million in stocks on Feb 13, 2020 — one day after a private briefing",
    "Senator Kelly Loeffler (R-GA) sold between $1.275M and $3.1M in stock starting Jan 24, 2020, the same day as her first COVID briefing",
    "Senator James Inhofe (R-OK) sold between $180,000 and $400,000 in early February 2020",
    "Senator Dianne Feinstein (D-CA) sold $1.5–6M in Allogene Therapeutics stock in late January and early February 2020",
    "The S&P 500 fell ~34% between Feb 20 and March 23, 2020 — those who sold in January/February avoided massive losses",
    "All four senators denied wrongdoing; all investigations were eventually closed without charges",
    "Burr voluntarily stepped aside as Intelligence Committee chair during the investigation — the only senator to face any consequence at all",
  ],

  timeline: [
    {
      date: "2020-01-24",
      title: "Senate Intelligence Committee COVID Briefing",
      description: "The full Senate received a classified briefing from administration health officials on the COVID-19 threat spreading in China. Intelligence Committee members received additional classified detail.",
      importance: "high",
      type: "briefing",
    },
    {
      date: "2020-01-24",
      title: "Loeffler Begins Selling",
      description: "The same day as her first COVID briefing, Senator Kelly Loeffler and her husband began selling stocks. Over the following weeks, they would sell between $1.275M and $3.1M in holdings.",
      importance: "high",
      type: "trade",
    },
    {
      date: "2020-02-06",
      title: "Inhofe Sells $180K–$400K",
      description: "Senator James Inhofe sold a series of stocks, claiming he had directed his financial advisors to move to less risky investments before the pandemic concerns.",
      importance: "medium",
      type: "trade",
    },
    {
      date: "2020-02-13",
      title: "Burr's Single-Day Sell-Off",
      description: "One day after a private briefing, Senator Richard Burr sold 33 transactions totaling between $628,000 and $1.72 million — virtually his entire personal stock portfolio.",
      importance: "high",
      type: "trade",
    },
    {
      date: "2020-02-14",
      title: "Burr Warns Private Group About Pandemic",
      description: "At a private luncheon for wealthy constituents at a D.C. hotel, Burr reportedly warned: 'There's one thing that I can tell you about this: It is much more aggressive in its transmission than anything that we have seen in recent history.' He described scenarios reminiscent of the 1918 flu pandemic.",
      importance: "high",
      type: "event",
    },
    {
      date: "2020-02-20",
      title: "Markets Begin Collapsing",
      description: "The S&P 500 begins its COVID crash. By March 23, it would fall 34% from its February high. The senators who sold in January and early February had avoided catastrophic losses.",
      importance: "high",
      type: "market",
    },
    {
      date: "2020-05-13",
      title: "FBI Seizes Burr's Phone",
      description: "FBI agents served a search warrant and seized Senator Burr's cell phone as part of the Department of Justice investigation into his trades.",
      importance: "high",
      type: "investigation",
    },
    {
      date: "2020-05-14",
      title: "Burr Steps Aside as Intelligence Chair",
      description: "Under pressure, Richard Burr temporarily stepped down as chairman of the Senate Intelligence Committee — the only accountability any senator faced.",
      importance: "medium",
      type: "consequence",
    },
    {
      date: "2021-01-19",
      title: "DOJ Closes Loeffler, Inhofe, Feinstein Investigations",
      description: "The Department of Justice closes investigations into three senators without charges, citing insufficient evidence of criminal intent.",
      importance: "medium",
      type: "investigation",
    },
    {
      date: "2021-09-10",
      title: "DOJ Closes Burr Investigation",
      description: "The Securities and Exchange Commission closed its investigation into Richard Burr. No charges were ever filed against any senator for COVID-related trading.",
      importance: "high",
      type: "investigation",
    },
  ],

  sections: [
    {
      id: "the-briefings",
      title: "The Briefings: What They Knew",
      content: `The U.S. Senate received multiple classified briefings in January and February 2020 about the novel coronavirus spreading in China. These were not public press conferences with generic warnings — they were closed-door intelligence sessions with classified detail about transmission rates, projected spread, and potential economic consequences.

## January 24: Full Senate Briefing

On January 24, 2020, the full Senate received a briefing from administration health officials. Members of the Senate Intelligence Committee, who have access to more sensitive threat assessments, received additional classified briefings around the same time.

Senator Burr, as chairman of the Intelligence Committee, had regular access to the most sensitive intelligence assessments. His committee's jurisdiction specifically includes monitoring biological threats to national security.

## What the Intelligence Said

While the specific contents of classified briefings cannot be fully disclosed, public reporting established that senators were warned about:

- COVID-19's high transmission rate compared to seasonal flu
- The likelihood of widespread community spread in the United States
- Potential economic disruption including to travel, hospitality, and retail sectors
- The inadequacy of existing public health infrastructure

This is precisely the kind of material, non-public information that securities law prohibits trading on.

## The Knowledge Asymmetry

While senators were receiving classified briefings about an imminent pandemic, ordinary Americans were hearing mixed messages. The CDC was still saying the risk to the public was "low." The market had not priced in a pandemic scenario. Those with access to intelligence had a massive informational advantage over every other investor.`,
    },
    {
      id: "the-trades",
      title: "The Trades: Who Sold What",
      content: `Financial disclosure reports filed under the STOCK Act revealed that at least four senators made significant stock sales in the days and weeks following classified COVID briefings. All four denied using classified information to inform their trades.

## Richard Burr (R-NC) — Senate Intelligence Committee Chairman

The most dramatic case. On February 13, 2020 — one day after a private briefing — Burr sold 33 separate transactions totaling between **$628,000 and $1.72 million**. This represented a substantial portion of his personal investment portfolio.

Among the stocks he dumped: companies in the hospitality sector, which would be devastated by pandemic lockdowns.

Burr subsequently told a private audience — in language that echoed the classified briefings he had received — that the pandemic would be severe and disruptive. He just didn't tell the public the same thing.

## Kelly Loeffler (R-GA) — Senate Commerce Subcommittee Member

Starting on January 24 — **the same day as her first COVID briefing** — Loeffler and her husband, Jeffrey Sprecher (chairman of the New York Stock Exchange), began selling stocks. Over the following weeks, they sold between **$1.275M and $3.1M** in stock.

Among the sold positions were hotel and restaurant stocks. Among the purchases: a company specializing in teleconference technology (a category that would boom during lockdowns).

Loeffler claimed she had no involvement in the transactions, which were handled by financial advisors. She was appointed to her Senate seat in January 2020 — she had been a senator for less than a month when the selling began.

## Dianne Feinstein (D-CA) — Senate Intelligence Committee Member

Feinstein's husband sold between **$1.5M and $6M** in stock in Allogene Therapeutics between January 31 and February 18, 2020. Feinstein said she had no involvement in her husband's investment decisions.

## James Inhofe (R-OK) — Senate Armed Services Committee Chairman

Inhofe sold between **$180,000 and $400,000** in stock in early February 2020. He claimed he had previously directed his financial advisor to move him away from equities.`,
    },
    {
      id: "the-investigations",
      title: "The Investigations: Why Nobody Was Charged",
      content: `All four senators were investigated by the Department of Justice. None were charged. Understanding why reveals the structural failures that allow congressional insider trading to persist.

## The Intent Problem

Securities fraud requires proving that a person traded on *material, non-public information* with *scienter* — i.e., knowing that they were doing something wrong. Proving this in a congressional context is extraordinarily difficult because:

1. **Deniability is easy**: Senators can claim their trades were pre-planned, managed by advisors, or based on publicly available information
2. **No paper trail**: There's no requirement to document the connection between a briefing and a trade
3. **Attorney-client privilege**: Senators' communications with staff and counsel about investments are often protected
4. **Congressional immunity concerns**: The Speech or Debate Clause complicates using legislative activities as evidence

## The STOCK Act's Toothless Enforcement

The Stop Trading on Congressional Knowledge (STOCK) Act of 2012 was supposed to fix this. It explicitly states that members of Congress are not exempt from insider trading laws and creates disclosure requirements.

But the law has significant weaknesses:
- **Penalties are a slap on the wrist**: First-time STOCK Act violations carry a $200 fine
- **Enforcement is self-directed**: Congress largely polices itself
- **The "advisor defense" is too easy**: Claiming a financial advisor handled the trades without your input is nearly impossible to disprove
- **Civil vs criminal standards**: DOJ pursued criminal charges but faced a higher evidentiary bar than the SEC would for civil enforcement

## What Happened to Each Senator

| Senator | Party | Amount Sold | Investigation Outcome |
|---------|-------|-------------|----------------------|
| Richard Burr | R-NC | $628K–$1.72M | DOJ & SEC closed, no charges |
| Kelly Loeffler | R-GA | $1.275M–$3.1M | DOJ closed, no charges |
| Dianne Feinstein | D-CA | $1.5M–$6M | DOJ closed, no charges |
| James Inhofe | R-OK | $180K–$400K | DOJ closed, no charges |

Burr was the only senator to face any formal consequence — temporarily stepping down as Intelligence Committee chairman. He did not seek re-election in 2022.

## The Broader Pattern

The COVID cases were not isolated incidents. They were the most visible examples of a pattern that the STOCK Act was supposed to prevent but has demonstrably failed to stop. The same structural problem — lawmakers with access to non-public information trading stocks in affected industries — continues today, as our analysis of 336 trading members of Congress demonstrates.`,
    },
    {
      id: "accountability-gaps",
      title: "The Accountability Gap: What Reform Looks Like",
      content: `Public outrage over the COVID trades generated significant momentum for reform. Multiple bills were introduced. None passed.

## The PELOSI Act and Similar Proposals

The "Preventing Elected Leaders from Owning Securities and Investments" (PELOSI) Act — named not after Nancy Pelosi but as an acronym — would ban members of Congress and their spouses from owning or trading individual stocks while in office. Similar proposals include:

- **TRUST in Congress Act** — requires members to place holdings in blind trusts
- **ETHICS Act** — comprehensive reform requiring blind trusts
- **Ban Congressional Stock Trading Act** — outright ban on individual stock ownership

All have stalled due to lack of floor time and, notably, opposition from the members who would be most affected.

## What Polling Says

Despite congressional inaction, public opinion is overwhelming:

- **86%** of Americans support banning members of Congress from trading individual stocks (Insider/YouGov, 2022)
- Majorities of both Republicans (85%) and Democrats (87%) support a ban
- This is one of the most bipartisan policy positions in contemporary polling

The gap between public opinion and legislative action on this issue is itself an accountability story.

## What You Can Do

Our [Stock Trades Leaderboard](/congress/trades) shows every trading member of Congress ranked by suspicious activity. 117 members are currently flagged for trading in sectors their committees directly oversee. You can look up your representative and see whether they are trading stocks in industries they regulate.

Democracy requires an informed public. We're providing the information.`,
    },
  ],

  individuals: [
    {
      name: "Richard Burr",
      role: "Senator (R-NC), former Intelligence Committee Chairman",
      party: "R",
      relevance: "Sold $628K–$1.72M one day after a private COVID briefing. Stepped down as Intelligence chair during DOJ investigation. Did not seek re-election in 2022.",
    },
    {
      name: "Kelly Loeffler",
      role: "Senator (R-GA)",
      party: "R",
      relevance: "Sold $1.275M–$3.1M starting the same day as her first COVID briefing. Lost her 2020 Senate runoff election to Jon Ossoff.",
    },
    {
      name: "Dianne Feinstein",
      role: "Senator (D-CA), Intelligence Committee Member",
      party: "D",
      relevance: "Her husband sold $1.5M–$6M in biotech stock while she sat on the Intelligence Committee. Claimed no involvement in his investment decisions.",
    },
    {
      name: "James Inhofe",
      role: "Senator (R-OK), Armed Services Committee Chairman",
      party: "R",
      relevance: "Sold $180K–$400K citing a prior directive to reduce equity exposure. Retired from Senate in 2023.",
    },
  ],

  sources: [
    {
      title: "Senate Stock Sales Prompt Insider Trading Questions",
      publication: "ProPublica",
      url: "https://www.propublica.org/article/senators-dumped-stocks-as-virus-fears-roiled-market",
      date: "2020-03-19",
      type: "investigation" as const,
    },
    {
      title: "Burr Sold Off Stocks Before Coronavirus Rout",
      publication: "NPR",
      url: "https://www.npr.org/2020/03/19/818192535/burr-sold-off-stocks-before-coronavirus-rout",
      date: "2020-03-19",
      type: "news" as const,
    },
    {
      title: "Justice Department Closes COVID Stock Trading Investigations Into Three Senators",
      publication: "The New York Times",
      url: "https://www.nytimes.com/2021/01/19/us/politics/covid-senators-stock-trades.html",
      date: "2021-01-19",
      type: "news" as const,
    },
    {
      title: "SEC Closes Investigation Into Burr's Stock Sales",
      publication: "The Hill",
      url: "https://thehill.com/homenews/senate/571345-sec-closes-investigation-into-burrss-pandemic-stock-sales",
      date: "2021-09-10",
      type: "news" as const,
    },
    {
      title: "86% Support Ban on Congressional Stock Trading",
      publication: "Insider / YouGov",
      url: "https://www.businessinsider.com/86-percent-support-ban-on-congressional-stock-trading-poll-2022-3",
      date: "2022-03-01",
      type: "data" as const,
    },
    {
      title: "STOCK Act: Congressional Insider Trading",
      publication: "Congressional Research Service",
      url: "https://crsreports.congress.gov/product/pdf/R/R43551",
      date: "2020-01-01",
      type: "official" as const,
    },
  ],

  relatedMembers: ["B001135", "L000577"],
};
