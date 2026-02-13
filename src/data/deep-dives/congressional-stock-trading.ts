import type { DeepDiveInvestigation } from "@/lib/types";

export const congressionalStockTrading: DeepDiveInvestigation = {
  id: "congressional-stock-trading",
  slug: "congressional-stock-trading",
  title: "Trading on Insider Knowledge",
  subtitle: "How Members of Congress Profit From Industries They Regulate",
  description: "A comprehensive investigation into congressional stock trading, conflicts of interest, and the failure of the STOCK Act to prevent lawmakers from profiting off their positions.",
  publishedDate: "2026-02-13",
  readTimeMinutes: 12,
  tags: ["Stock Trading", "Conflicts of Interest", "STOCK Act", "Ethics", "Both Parties"],
  
  summary: `Members of Congress routinely trade stocks in companies they directly regulate and oversee, creating inherent conflicts of interest that undermine public trust. Despite the 2012 STOCK Act requiring disclosure of trades within 45 days, violations are rampant and penalties are minimal. Analysis shows that congressional portfolios often outperform the market, raising questions about whether lawmakers are using non-public information to enrich themselves.

This investigation examines hundreds of trades by sitting members of Congress in 2022-2024, revealing patterns of trading in industries under their committee jurisdictions, delayed disclosures, and remarkable timing that coincides with major legislative developments. Both Democrats and Republicans engage in these practices, demonstrating that this is a systemic problem requiring comprehensive reform.`,
  
  keyFindings: [
    "44% of House members and 54% of Senators own individual stocks, creating direct conflicts of interest",
    "Congressional Democrats achieved returns well over the S&P 500 Index in 2023, with some portfolios doubling market performance",
    "62 members of Congress violated the STOCK Act disclosure requirements between 2021-2024, with minimal consequences",
    "Rep. Byron Donalds (R-FL) failed to disclose 108 trades worth up to $1.6 million, including stocks in companies that lobbied his bills",
    "Nancy Pelosi's husband made high-profile tech stock trades coinciding with chip legislation, including Nvidia trades before and after the CHIPS Act",
    "Rep. Donalds' portfolio included over 108 trades in 2022-2023 in companies that donated to his campaign or lobbied bills he sponsored",
    "13 lawmakers traded in companies under investigation by their own committees between 2019-2021",
    "86% of Americans across party lines support banning congressional stock trading"
  ],
  
  sections: [
    {
      id: "the-problem",
      title: "The Problem: Lawmakers Trading What They Regulate",
      content: `The fundamental issue is simple: members of Congress have access to non-public information through classified briefings, committee hearings, and private meetings with industry leaders. They also have the power to craft legislation that directly impacts company valuations. When these same lawmakers trade stocks in the industries they oversee, it creates an insurmountable conflict of interest.

## Scale of the Issue

According to Campaign Legal Center's comprehensive review of financial disclosure reports filed in 2024:

- **44% of House members** and **54% of Senators** own individual stocks
- Only 6% of House members and 2% of Senators hold no stocks or widely-held investment funds
- Congressional stock owners made approximately **11,000 trades** throughout 2023

The sheer volume of trading activity by lawmakers is staggering. These are not passive investors holding diversified index funds—many actively trade specific stocks in sectors they directly regulate.

## Outperforming the Market

Perhaps most troubling is the remarkable performance of congressional portfolios. In 2023, a Unusual Whales report found that more than 20 members of Congress earned nearly **double the S&P 500's average gain**. Democratic portfolios in particular showed returns "well over the S&P 500 Index," according to OpenSecrets data.

When your portfolio consistently beats professional investors and the market average, one has to ask: what information are you trading on?

## Committee Jurisdiction = Trading Advantage

A 2022 New York Times investigation revealed that **44 of the 50 members of Congress most active in the markets** bought or sold securities in companies over which their committee assignments could give them "some degree of knowledge or influence."

Even more damning: **13 lawmakers** reported buying or selling shares in companies that were **under investigation by their own committees** between 2019 and 2021.

This is not passive investing. This is systematic exploitation of position for personal gain.`
    },
    {
      id: "case-studies",
      title: "Case Studies: Who's Trading What",
      content: `## Byron Donalds (R-FL): Over 100 Undisclosed Trades

Rep. Byron Donalds presents one of the most egregious recent examples of STOCK Act violations and conflicts of interest. Throughout 2022 and 2023, Donalds made **at least 108 trades** in dozens of companies with a total value ranging from **$108,108 to $1,620,000**.

The problem? **He failed to disclose any of them within the required 45-day window.** In fact, Campaign Legal Center's complaint alleges he failed to file the required Periodic Transaction Reports (PTRs) altogether.

Even more concerning: some of these trades were in companies that **donated to his campaign or lobbied bills he sponsored or cosponsored**. This creates a circular relationship where companies with business before Congress donate to a lawmaker, who then invests in those same companies while crafting legislation affecting their industries.

Despite publicly supporting enforcement of the STOCK Act, Donalds joins a bipartisan pattern of members flagrantly ignoring disclosure requirements.

## Nancy Pelosi (D-CA): The Tech Trade Queen

Perhaps no lawmaker's trading activity has attracted more scrutiny than former Speaker Nancy Pelosi—or more accurately, her husband Paul Pelosi's trades. While Pelosi herself has denied involvement in her husband's investment decisions, the timing of his trades has raised eyebrows across the political spectrum.

**The Nvidia Saga:**
- Paul Pelosi traded Nvidia stock in 2023 while the CHIPS and Science Act was being negotiated and voted on
- The CHIPS Act provided massive subsidies to semiconductor companies like Nvidia
- Pelosi family trades continued in Nvidia throughout 2024 and 2025 amid changing export controls on AI chips
- Similar patterns emerged with Apple and Tesla trades coinciding with significant legislative developments

While technically legal (spouses can trade), critics argue this represents exactly the type of conflict of interest that undermines public trust. Even if Pelosi claims no involvement, she has access to information that could benefit trading decisions, and her husband's portfolio grows accordingly.

## Tommy Tuberville (R-AL): Defense Stock Trading on Armed Services Committee

Sen. Tommy Tuberville, a member of the Senate Armed Services Committee, reported owning nearly **$200,000 worth of stock** in major defense contractors including:
- Honeywell
- Lockheed Martin  
- General Electric
- Raytheon
- General Dynamics

As an Armed Services Committee member, Tuberville helps set defense policy, approve Pentagon budgets, and oversee the very companies in his portfolio. This creates an obvious incentive to support policies favorable to defense contractors.

Tuberville also violated the federal STOCK Act by failing to timely disclose multiple transactions, demonstrating the widespread disregard for even minimal transparency requirements.

## Widespread Committee-Related Trading

Business Insider's investigation identified numerous members making trades in companies directly related to their committee assignments:

- Members of the House Armed Services Committee trading defense contractor stocks
- Members of House Financial Services trading bank stocks during banking regulation debates
- Members of Energy and Commerce trading pharmaceutical and health insurance stocks
- Members of House Science, Space and Technology trading tech stocks during antitrust discussions

The pattern is clear and bipartisan: lawmakers use their committee positions to identify investment opportunities, then profit from the very industries they're supposed to oversee on behalf of the public.`
    },
    {
      id: "stock-act-failure",
      title: "The STOCK Act's Failure",
      content: `## What the Law Requires

The Stop Trading on Congressional Knowledge (STOCK) Act of 2012 was passed with great fanfare after a 60 Minutes investigation exposed congressional insider trading. The law requires:

- Members of Congress must file Periodic Transaction Reports (PTRs) within **45 days** of any stock trade
- Reports must include: transaction date, security identifier, transaction type, and amount range
- Violations carry penalties starting at $200 for late filings

The goal was transparency: if the public knew what lawmakers were trading in real-time, it would create accountability and deter conflicts of interest.

## Why It Doesn't Work

**Minimal Penalties:** The penalties for violating the STOCK Act are laughably small. A $200 fine for failing to disclose a trade that might have made you $50,000? That's not a deterrent—it's a cost of doing business.

Between 2021-2024, **62 members of Congress violated STOCK Act disclosure requirements**. Some violations were years late. Rep. Ruben Gallego (D-AZ) disclosed transactions that were **two and five years late**. Rep. Russ Fulcher (R-ID) disclosed a 2022 sale of Banc of California stock... in May 2023—more than a year late.

**No Trading Ban:** The STOCK Act requires disclosure but doesn't prohibit trading itself. This is like requiring bank robbers to file paperwork but not making robbery illegal. Transparency without prohibition is meaningless when the underlying behavior is unethical.

**Weak Enforcement:** The penalties are rarely enforced, and when they are, they're trivial. Campaign Legal Center has filed multiple complaints with the Office of Congressional Ethics, but consequences remain minimal.

## Members Acknowledge the Problem

Even members of Congress admit the system is broken. After reports of trading during the 2023 bank crisis, multiple senators acknowledged the obvious conflicts of interest.

Sen. Josh Hawley (R-MO) stated: "Members of Congress should not be allowed to profit from the industries they're supposed to oversee."

The bipartisan ETHICS Act, which would ban congressional stock trading entirely, has support from members including:
- Brian Fitzpatrick (R-PA)
- Alexandria Ocasio-Cortez (D-NY)
- Chip Roy (R-TX)
- Pramila Jayapal (D-WA)
- Tim Burchett (R-TN)

If lawmakers themselves admit they shouldn't be trading stocks, why are we still debating this?`
    },
    {
      id: "public-trust",
      title: "The Cost to Democracy",
      content: `## Eroding Public Trust

When citizens see their representatives getting rich off the very industries they regulate, it corrodes faith in democratic institutions. How can the public trust that Congress will regulate Wall Street fairly when so many members are personally invested in financial services stocks? How can we believe they'll hold Big Tech accountable when their portfolios are full of Apple, Microsoft, and Nvidia?

Poll after poll shows the American people want this to end. According to multiple surveys, **86% of Americans across party lines** support prohibiting members of Congress from trading stocks. This is one of the few issues with genuine bipartisan public consensus.

Yet Congress refuses to act. Why? Perhaps because the people who would have to vote for a ban are the same people profiting from the current system.

## Systemic Corruption

This isn't about a few bad apples. This is systemic. When 44-54% of Congress owns individual stocks, when violations are routine, when penalties are minimal, and when committee members actively trade in their jurisdictions—that's not a bug, it's a feature.

The revolving door between Congress and lobbying firms is well-documented. But the stock trading issue reveals something more insidious: lawmakers don't even need to wait until they leave office to cash in. They can profit in real-time while still in power.

## What Needs to Change

**Ban Trading Entirely:** The ETHICS Act would prohibit members of Congress, the President, and Vice President from buying or selling stocks, securities, commodities, or futures while in office. Existing holdings would need to be divested or placed in blind trusts.

**Real Penalties:** Under the ETHICS Act, violations would carry penalties equal to either the member's monthly salary or 10% of the asset's value—whichever is greater. This is a real deterrent, not a symbolic gesture.

**Immediate Passage:** The ETHICS Act made it through the Senate Homeland Security Committee with bipartisan support. It needs to reach the floor for a vote. Given the overwhelming public support, every member should be on record: are you willing to give up personal trading profits for the integrity of your office?

The question is simple: Do we want a Congress that serves the public interest, or one that serves their investment portfolios?`
    }
  ],
  
  timeline: [
    {
      date: "2012-04-04",
      title: "STOCK Act Passed",
      description: "Congress passes the Stop Trading on Congressional Knowledge Act after 60 Minutes investigation exposes insider trading. Requires 45-day disclosure of trades.",
      importance: "high"
    },
    {
      date: "2019-01-01",
      title: "Committee-Related Trading Accelerates",
      description: "13 lawmakers trade stocks in companies under investigation by their own committees throughout 2019-2021.",
      importance: "high"
    },
    {
      date: "2022-01-01",
      title: "Byron Donalds Trading Period Begins",
      description: "Rep. Donalds makes 108 trades worth up to $1.6M throughout 2022-2023, failing to disclose any within required timeframe.",
      importance: "high"
    },
    {
      date: "2023-01-01",
      title: "Congressional Portfolios Outperform Market",
      description: "More than 20 members of Congress earn nearly double the S&P 500's average gain. Democratic portfolios show particularly high returns.",
      importance: "high"
    },
    {
      date: "2023-08-09",
      title: "CHIPS Act Signed Into Law",
      description: "Major semiconductor subsidies pass. Nancy Pelosi's husband had traded Nvidia stock during negotiations and continued trading after passage.",
      importance: "high"
    },
    {
      date: "2024-08-13",
      title: "Rep. Gallego's Years-Late Disclosures",
      description: "Rep. Ruben Gallego (D-AZ) discloses transactions from 2019 and 2022—two and five years late.",
      importance: "medium"
    },
    {
      date: "2024-09-01",
      title: "62 Members Identified as STOCK Act Violators",
      description: "Raw Story investigation reveals 62 members of Congress violated disclosure requirements between 2021-2024.",
      importance: "high"
    },
    {
      date: "2024-11-01",
      title: "Campaign Legal Center Files Donalds Complaint",
      description: "CLC files complaint with Office of Congressional Ethics alleging Rep. Donalds violated STOCK Act by failing to disclose 108 trades.",
      importance: "high"
    },
    {
      date: "2024-12-01",
      title: "ETHICS Act Advances",
      description: "Senate Homeland Security Committee votes to advance the ETHICS Act, which would ban congressional stock trading entirely.",
      importance: "high"
    }
  ],
  
  financialData: [
    {
      label: "Byron Donalds (R-FL)",
      value: 1620000,
      party: "R",
      category: "Undisclosed Trades 2022-2023"
    },
    {
      label: "Tommy Tuberville (R-AL)",
      value: 200000,
      party: "R",
      category: "Defense Stock Holdings"
    },
    {
      label: "Congressional Trading Volume",
      value: 11000,
      category: "Total Trades in 2023"
    },
    {
      label: "House Stock Ownership",
      value: 44,
      category: "Percentage Owning Individual Stocks"
    },
    {
      label: "Senate Stock Ownership",
      value: 54,
      category: "Percentage Owning Individual Stocks"
    },
    {
      label: "STOCK Act Violators",
      value: 62,
      category: "Members Violating Disclosure 2021-2024"
    },
    {
      label: "Committee-Related Trades",
      value: 44,
      category: "Top 50 Traders in Committee Jurisdictions"
    },
    {
      label: "Public Support for Ban",
      value: 86,
      category: "Percentage Supporting Trading Ban"
    }
  ],
  
  individuals: [
    {
      name: "Byron Donalds",
      bioguide_id: "D000032",
      role: "U.S. Representative (FL-19)",
      party: "R",
      relevance: "Failed to disclose 108 trades worth up to $1.6M in 2022-2023. Traded in companies that lobbied his bills.",
      financialData: [
        { label: "Undisclosed Trades (Min)", value: 108108 },
        { label: "Undisclosed Trades (Max)", value: 1620000 },
        { label: "Number of Trades", value: 108 }
      ]
    },
    {
      name: "Nancy Pelosi",
      bioguide_id: "P000197",
      role: "U.S. Representative (CA-11), Former Speaker",
      party: "D",
      relevance: "Husband Paul Pelosi made high-profile tech trades including Nvidia during CHIPS Act negotiations. Continues to be named in stock trading discussions.",
      financialData: []
    },
    {
      name: "Tommy Tuberville",
      bioguide_id: "T000278",
      role: "U.S. Senator (AL)",
      party: "R",
      relevance: "Holds nearly $200K in defense contractor stocks while serving on Senate Armed Services Committee. Violated STOCK Act disclosure requirements.",
      financialData: [
        { label: "Defense Stock Holdings", value: 200000 }
      ]
    },
    {
      name: "Ruben Gallego",
      bioguide_id: "G000574",
      role: "U.S. Representative (AZ-03)",
      party: "D",
      relevance: "Disclosed stock transactions 2-5 years late in violation of STOCK Act.",
      financialData: []
    },
    {
      name: "Russ Fulcher",
      bioguide_id: "F000469",
      role: "U.S. Representative (ID-01)",
      party: "R",
      relevance: "Disclosed 2022 Banc of California stock sale over one year late.",
      financialData: []
    }
  ],
  
  sources: [
    {
      type: "official_report",
      title: "CLC Complaint to OCE Regarding Rep. Byron Donalds",
      publication: "Campaign Legal Center",
      url: "https://campaignlegal.org/document/clc-complaint-oce-regarding-rep-byron-donalds",
      published_date: "2024-11-01",
      credibility_rating: "high"
    },
    {
      type: "news",
      title: "Congressional Stock Trading Continues to Raise Conflicts of Interest Concerns",
      publication: "Campaign Legal Center",
      url: "https://campaignlegal.org/update/congressional-stock-trading-continues-raise-conflicts-interest-concerns",
      published_date: "2024-11-15",
      credibility_rating: "high"
    },
    {
      type: "news",
      title: "Congressional Stock Trading: Who Trades and Makes the Most",
      publication: "The Motley Fool",
      url: "https://www.fool.com/research/congressional-stock-trading-who-trades-and-makes-the-most/",
      published_date: "2025-01-20",
      credibility_rating: "high"
    },
    {
      type: "news",
      title: "These 62 members of Congress have violated a conflicts-of-interest law",
      publication: "Raw Story",
      url: "https://www.rawstory.com/congress-stock/",
      published_date: "2024-10-17",
      credibility_rating: "high"
    },
    {
      type: "news",
      title: "Congress Trading Report 2024",
      publication: "Unusual Whales",
      url: "https://unusualwhales.com/congress-trading-report-2024",
      published_date: "2024-12-31",
      credibility_rating: "high"
    },
    {
      type: "news",
      title: "Politician Trading: If You Can't Stop Them, Join Them",
      publication: "Ballard Spahr",
      url: "https://www.ballardspahr.com/insights/alerts-and-articles/2024/10/politician-trading-if-you-cant-stop-them-join-them",
      published_date: "2024-10-15",
      credibility_rating: "high"
    },
    {
      type: "news",
      title: "Meet the Congress Members Trading Defense Stocks While Shaping Military Policy",
      publication: "Business Insider / Truthout",
      url: "https://truthout.org/articles/meet-the-congress-members-trading-defense-stocks-while-shaping-military-policy/",
      published_date: "2022-09-19",
      credibility_rating: "high"
    }
  ],
  
  relatedMembers: ["D000032", "P000197", "T000278", "G000574", "F000469"]
};
