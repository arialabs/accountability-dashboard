/**
 * Curated data on the Department of Government Efficiency (DOGE)
 * Led by Elon Musk from January 20 - May 2025
 * 
 * All data sourced from public reporting by AP, Reuters, NYT, Guardian, 
 * CNBC, Fortune, Wikipedia, Congress.gov, and other credible outlets.
 * Last updated: February 2026
 */

export interface DogeAction {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'layoff' | 'program_cut' | 'agency_access' | 'contract_cancel' | 'legal' | 'controversy' | 'reversal';
  impact: 'critical' | 'high' | 'medium' | 'low';
  affectedAgencies: string[];
  estimatedWorkersAffected?: number;
  estimatedFinancialImpact?: string;
  sources: string[];
}

export interface ConflictOfInterest {
  id: string;
  company: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  contractValue?: string;
  details: string;
  sources: string[];
}

export interface LawsuitInfo {
  id: string;
  title: string;
  court: string;
  filedDate: string;
  status: 'active' | 'settled' | 'dismissed' | 'ruling_issued';
  description: string;
  outcome?: string;
  sources: string[];
}

export interface AffectedAgency {
  name: string;
  abbreviation: string;
  workersAffected: number;
  budgetImpact?: string;
  keyActions: string[];
  status: 'severely_cut' | 'partially_cut' | 'targeted' | 'partially_restored';
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  age?: number;
  background: string;
  previousEmployer?: string[];
  tenure: {
    start: string;
    end?: string;
  };
  notableActions?: string[];
  controversies?: string[];
  conflictOfInterest?: boolean;
  sources: string[];
}

export interface DogeProfile {
  leader: {
    name: string;
    title: string;
    role: string;
    startDate: string;
    endDate?: string;
    photoUrl: string;
    bio: string;
    netWorth: string;
  };
  overview: {
    established: string;
    disbanded?: string;
    originalGoal: string;
    claimedSavings: string;
    independentEstimateOfSavings: string;
    actualSpendingChange: string;
    totalWorkersAffected: number;
    deferredResignations: number;
    agenciesTargeted: number;
    lawsuitsFiled: number;
    courtOrdersAgainst: number;
  };
  timeline: DogeAction[];
  conflictsOfInterest: ConflictOfInterest[];
  lawsuits: LawsuitInfo[];
  affectedAgencies: AffectedAgency[];
  staff: StaffMember[];
  keyStats: {
    label: string;
    value: string;
    context?: string;
    trend?: 'up' | 'down' | 'neutral';
  }[];
}

export const dogeData: DogeProfile = {
  leader: {
    name: "Elon Musk",
    title: "Head of DOGE",
    role: "Special Government Employee (SGE)",
    startDate: "2025-01-20",
    endDate: "2025-05-30",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/440px-Elon_Musk_Royal_Society_%28crop2%29.jpg",
    bio: "Elon Musk, CEO of Tesla and SpaceX and owner of X (formerly Twitter), was appointed to lead the Department of Government Efficiency on January 20, 2025. Despite the name, DOGE was not a formal government department but an advisory body operating under executive authority. Musk departed Washington in May 2025, and DOGE was quietly disbanded by late 2025, with its functions absorbed by the Office of Personnel Management.",
    netWorth: "~$350 billion (as of early 2025)",
  },
  overview: {
    established: "2025-01-20",
    disbanded: "2025-11-01",
    originalGoal: "Cut $2 trillion in federal spending and modernize government technology",
    claimedSavings: "$206 billion (per DOGE website)",
    independentEstimateOfSavings: "~$40 billion annually from workforce cuts (Cato Institute)",
    actualSpendingChange: "Federal spending rose $248 billion in first 11 months of 2025 vs. 2024 (CBO)",
    totalWorkersAffected: 352000,
    deferredResignations: 123000,
    agenciesTargeted: 18,
    lawsuitsFiled: 65,
    courtOrdersAgainst: 24,
  },
  keyStats: [
    {
      label: "Workers Who Exited",
      value: "352,000",
      context: "Federal employees who left roles in 2025 (OPM data)",
      trend: "up",
    },
    {
      label: "Deferred Resignations",
      value: "123,000",
      context: "Workers who accepted the \"Fork in the Road\" buyout offer",
      trend: "up",
    },
    {
      label: "Claimed Savings",
      value: "$206B",
      context: "Per DOGE's own website — many claims found to be erroneous (NYT analysis)",
      trend: "neutral",
    },
    {
      label: "Actual Spending Change",
      value: "+$248B",
      context: "Federal spending INCREASED $248B in 2025 vs 2024 despite cuts (CBO)",
      trend: "down",
    },
    {
      label: "Lawsuits Filed",
      value: "65+",
      context: "Legal challenges against DOGE actions in federal courts",
      trend: "up",
    },
    {
      label: "Court Orders Against",
      value: "24",
      context: "TROs and injunctions issued by federal judges blocking DOGE actions",
      trend: "up",
    },
    {
      label: "STEM Experts Lost",
      value: "10,109",
      context: "PhDs who left federal service in 2025 — 14% of total federal PhDs",
      trend: "up",
    },
    {
      label: "Musk's Gov't Contracts",
      value: "$38B+",
      context: "Total government funding received by Musk's companies (Tesla, SpaceX)",
      trend: "neutral",
    },
  ],
  timeline: [
    {
      id: "doge-001",
      date: "2025-01-20",
      title: "DOGE Established via Executive Order",
      description: "Trump signs executive order creating the Department of Government Efficiency, appointing Elon Musk to lead. The order mandates modernizing government technology and increasing efficiency.",
      category: "agency_access",
      impact: "critical",
      affectedAgencies: ["All Federal Agencies"],
      sources: ["https://www.whitehouse.gov/presidential-actions/"],
    },
    {
      id: "doge-002",
      date: "2025-01-22",
      title: "DOGE Teams Enter Federal Agencies",
      description: "Musk and DOGE staff begin appearing at offices of numerous agencies, starting with the General Services Administration, questioning employees and demanding access to systems and data.",
      category: "agency_access",
      impact: "high",
      affectedAgencies: ["GSA", "Treasury", "OPM", "SSA"],
      sources: ["https://www.theguardian.com/technology/2025/may/30/elon-musk-doge-timeline"],
    },
    {
      id: "doge-003",
      date: "2025-01-28",
      title: "\"Fork in the Road\" Email Sent to 2M+ Workers",
      description: "More than 2 million federal employees receive an email titled \"Fork in the Road\" encouraging them to accept a deferred resignation buyout. Approximately 123,000 ultimately accepted.",
      category: "layoff",
      impact: "critical",
      affectedAgencies: ["All Federal Agencies"],
      estimatedWorkersAffected: 123000,
      sources: ["https://www.cnbc.com/2026/02/12/after-doge-cuts-federal-workers-new-roles.html"],
    },
    {
      id: "doge-004",
      date: "2025-02-01",
      title: "DOGE Gains Access to Treasury Payment Systems",
      description: "DOGE operatives gain access to Bureau of Fiscal Service systems that process trillions in federal payments including Social Security, Medicare, and tax refunds. Multiple lawsuits follow.",
      category: "agency_access",
      impact: "critical",
      affectedAgencies: ["Treasury"],
      sources: ["https://www.congress.gov/crs-product/LSB11370"],
    },
    {
      id: "doge-005",
      date: "2025-02-03",
      title: "First Lawsuits Filed Against DOGE",
      description: "Alliance for Retired Americans v. Bessent filed in D.C. District Court, seeking to block DOGE access to Treasury databases containing sensitive personal data of millions of Americans.",
      category: "legal",
      impact: "high",
      affectedAgencies: ["Treasury"],
      sources: ["https://www.congress.gov/crs-product/LSB11370"],
    },
    {
      id: "doge-006",
      date: "2025-02-07",
      title: "USAID Effectively Shut Down",
      description: "DOGE operatives move to gut the U.S. Agency for International Development (USAID), the world's largest humanitarian aid organization. Nearly all staff placed on administrative leave or fired. Global aid programs disrupted worldwide.",
      category: "program_cut",
      impact: "critical",
      affectedAgencies: ["USAID"],
      estimatedWorkersAffected: 10000,
      estimatedFinancialImpact: "$40B+ in active aid programs disrupted",
      sources: ["https://apnews.com/article/doge-firings-layoffs-federal-government-workers-musk"],
    },
    {
      id: "doge-007",
      date: "2025-02-10",
      title: "CFPB Gutted — 200+ Workers Cut",
      description: "Consumer Financial Protection Bureau decimated with approximately 200 workers cut, most of whom were not probationary employees. The agency's consumer protection functions severely impaired.",
      category: "layoff",
      impact: "critical",
      affectedAgencies: ["CFPB"],
      estimatedWorkersAffected: 200,
      sources: ["https://www.newsweek.com/doge-layoffs-federal-government-tracker-2025"],
    },
    {
      id: "doge-008",
      date: "2025-02-14",
      title: "Mass Firings Across Multiple Agencies",
      description: "Thousands of probationary federal employees fired across HHS, Education, Energy, EPA, IRS, and other agencies. Some agencies lose critical institutional knowledge overnight.",
      category: "layoff",
      impact: "critical",
      affectedAgencies: ["HHS", "Education", "Energy", "EPA", "IRS"],
      estimatedWorkersAffected: 15000,
      sources: ["https://apnews.com/article/doge-firings-layoffs-federal-government-workers-musk"],
    },
    {
      id: "doge-009",
      date: "2025-02-19",
      title: "Bird Flu Experts Rehired After Backlash",
      description: "HHS scrambles to rehire workers involved in the government's bird flu response who were among those fired by DOGE. The outbreak had devastated egg and poultry farms for three years.",
      category: "reversal",
      impact: "high",
      affectedAgencies: ["HHS"],
      sources: ["https://apnews.com/article/doge-firings-layoffs-federal-government-workers-musk"],
    },
    {
      id: "doge-010",
      date: "2025-02-22",
      title: "14 States Sue to Block DOGE Cuts",
      description: "A coalition of 14 state attorneys general file lawsuit challenging Musk's efforts to slash federal spending, arguing DOGE exceeded its authority and violated separation of powers.",
      category: "legal",
      impact: "high",
      affectedAgencies: ["All Federal Agencies"],
      sources: ["https://www.reuters.com/world/us/us-judge-allows-states-lawsuit-against-doge-proceed-2025-05-27/"],
    },
    {
      id: "doge-011",
      date: "2025-03-09",
      title: "Conflicts of Interest Exposed",
      description: "Le Monde and other outlets detail how DOGE intervenes in agencies that regulate Musk's companies — Tesla (NHTSA, EPA), SpaceX (FAA, DoD, NASA), Neuralink (FDA), and X (FTC, SEC).",
      category: "controversy",
      impact: "critical",
      affectedAgencies: ["NHTSA", "EPA", "FAA", "DoD", "NASA", "FDA", "FTC", "SEC"],
      sources: ["https://www.lemonde.fr/en/pixels/article/2025/03/09/behind-musk-s-doge-conflicts-of-interest"],
    },
    {
      id: "doge-012",
      date: "2025-03-20",
      title: "Court Issues TRO on DOGE Data Access at SSA",
      description: "Federal judge issues temporary restraining order blocking DOGE access to Social Security Administration data. Later revealed that DOGE members circumvented IT rules and improperly shared private records.",
      category: "legal",
      impact: "high",
      affectedAgencies: ["SSA"],
      sources: ["https://www.npr.org/2026/01/23/nx-s1-5684185/doge-data-social-security-privacy"],
    },
    {
      id: "doge-013",
      date: "2025-03-25",
      title: "Starlink Installed in White House",
      description: "Musk's Starlink internet service installed in the White House, raising further conflict of interest concerns as DOGE reviews telecom and defense contracts.",
      category: "controversy",
      impact: "medium",
      affectedAgencies: ["White House"],
      sources: ["https://www.theguardian.com/technology/2025/mar/25/doge-musk-spacex-starlink-contracts"],
    },
    {
      id: "doge-014",
      date: "2025-04-09",
      title: "$9.5B Defense Contracts Investigation",
      description: "Reps. Lynch and Connolly launch investigation into Musk's conflicts of interest at the Department of Defense, citing $9.5 billion in SpaceX defense contracts while DOGE reviews DoD spending.",
      category: "controversy",
      impact: "critical",
      affectedAgencies: ["DoD"],
      estimatedFinancialImpact: "$9.5B in SpaceX defense contracts",
      sources: ["https://lynch.house.gov/2025/4/reps-lynch-and-connolly-lead-oversight-investigation"],
    },
    {
      id: "doge-015",
      date: "2025-04-28",
      title: "DOGE Cuts May Cost Taxpayers $135B",
      description: "Fortune reports that mass federal workforce cuts may cost taxpayers $135 billion in FY2025 alone due to severance, rehiring costs, institutional knowledge loss, and service disruptions.",
      category: "controversy",
      impact: "critical",
      affectedAgencies: ["All Federal Agencies"],
      estimatedFinancialImpact: "$135B potential cost to taxpayers",
      sources: ["https://fortune.com/article/doge-mass-federal-workforce-cuts-taxpayers-billions/"],
    },
    {
      id: "doge-016",
      date: "2025-05-27",
      title: "Judge Allows States' Lawsuit to Proceed",
      description: "Federal judge rules the 14-state coalition lawsuit against DOGE can proceed, rejecting the administration's motion to dismiss. Signals growing legal jeopardy for DOGE operations.",
      category: "legal",
      impact: "high",
      affectedAgencies: ["All Federal Agencies"],
      sources: ["https://www.reuters.com/world/us/us-judge-allows-states-lawsuit-against-doge-proceed-2025-05-27/"],
    },
    {
      id: "doge-017",
      date: "2025-05-30",
      title: "Musk Officially Leaves Washington",
      description: "Elon Musk departs his role at DOGE. Trump begins speaking about DOGE in past tense. Operations quietly wind down.",
      category: "controversy",
      impact: "high",
      affectedAgencies: [],
      sources: ["https://www.theguardian.com/technology/2025/may/30/elon-musk-doge-timeline"],
    },
    {
      id: "doge-018",
      date: "2025-07-01",
      title: "ProPublica Identifies 100+ DOGE Members",
      description: "ProPublica investigation identifies more than 100 DOGE members. At least 23 made cuts at agencies that regulate industries where they have personal financial interests. ~40 are tied to Musk.",
      category: "controversy",
      impact: "high",
      affectedAgencies: ["All Federal Agencies"],
      sources: ["https://en.wikipedia.org/wiki/Department_of_Government_Efficiency"],
    },
    {
      id: "doge-019",
      date: "2025-09-24",
      title: "Hundreds of Fired GSA Workers Asked to Return",
      description: "Hundreds of General Services Administration employees fired by DOGE are asked to return to work, marking a major reversal and acknowledgment that cuts went too far.",
      category: "reversal",
      impact: "high",
      affectedAgencies: ["GSA"],
      sources: ["https://www.forbes.com/sites/saradorn/2025/09/24/hundreds-of-federal-employees-fired-by-doge-return-to-work-report-says/"],
    },
    {
      id: "doge-020",
      date: "2025-10-01",
      title: "Agencies Rehiring, Spending Rebounds",
      description: "OPB reports federal agencies are rehiring workers and spending is increasing after DOGE cuts. The 'wall of receipts' on DOGE's website only accounts for part of unverifiable $206B savings claim.",
      category: "reversal",
      impact: "high",
      affectedAgencies: ["All Federal Agencies"],
      sources: ["https://www.opb.org/article/2025/10/01/doge-cuts-to-federal-government-staffing-and-spending-are-being-undone/"],
    },
    {
      id: "doge-021",
      date: "2025-11-03",
      title: "CFPB Data Security Declared 'Ineffective'",
      description: "Federal Reserve Inspector General report states DOGE's cuts to the CFPB made its personal data security program 'ineffective,' putting millions of Americans' financial data at risk.",
      category: "controversy",
      impact: "critical",
      affectedAgencies: ["CFPB"],
      sources: ["https://en.wikipedia.org/wiki/Department_of_Government_Efficiency"],
    },
    {
      id: "doge-022",
      date: "2025-11-23",
      title: "DOGE Quietly Disbanded",
      description: "Reuters reveals DOGE has been quietly disbanded. OPM has taken over many of its former responsibilities. Trump administration officials decline to comment.",
      category: "controversy",
      impact: "high",
      affectedAgencies: [],
      sources: ["https://www.theguardian.com/us-news/2025/nov/23/trump-musk-doge-reportedly-disbanded"],
    },
    {
      id: "doge-023",
      date: "2025-12-23",
      title: "NYT: DOGE Disrupted Much, Saved Little",
      description: "New York Times analysis concludes many of DOGE's largest savings claims were wrong. While thousands of smaller cuts jolted aid recipients and small businesses, they amounted to little in scale of federal budget.",
      category: "controversy",
      impact: "critical",
      affectedAgencies: ["All Federal Agencies"],
      estimatedFinancialImpact: "Most large savings claims found erroneous",
      sources: ["https://www.nytimes.com/2025/12/23/us/politics/doge-musk-trump-analysis.html"],
    },
    {
      id: "doge-024",
      date: "2026-01-06",
      title: "Cato Institute: Spending Kept Rising Despite Cuts",
      description: "The libertarian Cato Institute confirms DOGE produced the 'largest peacetime workforce cut on record' but federal spending kept rising. A 10% workforce cut only saves ~$40B annually — far from the $2T goal.",
      category: "controversy",
      impact: "high",
      affectedAgencies: ["All Federal Agencies"],
      estimatedFinancialImpact: "~$40B annual savings from workforce cuts vs $2T goal",
      sources: ["https://www.cato.org/blog/doge-produced-largest-peacetime-workforce-cut-record-spending-kept-rising-0"],
    },
    {
      id: "doge-025",
      date: "2026-02-05",
      title: "Musk Ordered to Sit for Deposition Over USAID",
      description: "Federal judge orders Elon Musk and State Department officials to sit for depositions over their role in dismantling USAID, in lawsuit by anonymous USAID employees.",
      category: "legal",
      impact: "critical",
      affectedAgencies: ["USAID", "State"],
      sources: ["https://www.axios.com/2026/02/05/state-department-elon-musk-doge"],
    },
  ],
  conflictsOfInterest: [
    {
      id: "coi-001",
      company: "SpaceX",
      description: "SpaceX holds $9.5B+ in defense contracts while DOGE reviewed DoD spending",
      severity: "critical",
      contractValue: "$9.5 billion+",
      details: "SpaceX is one of the Pentagon's largest contractors. While leading DOGE, Musk's team reviewed DoD budgets and contracts, creating a direct conflict where he could influence spending on his own company's contracts. SpaceX also proposed the 'Golden Dome' missile system as a subscription service to the Pentagon.",
      sources: ["https://lynch.house.gov/2025/4/reps-lynch-and-connolly-lead-oversight-investigation"],
    },
    {
      id: "coi-002",
      company: "SpaceX / NASA",
      description: "SpaceX holds extensive NASA launch contracts while DOGE accessed NASA systems",
      severity: "critical",
      contractValue: "$3.5 billion+",
      details: "NASA maintains extensive contracts with SpaceX for space launch services including crewed missions to ISS and Artemis lunar program. DOGE teams accessed NASA systems while Musk's company was the primary beneficiary of NASA launch contracts.",
      sources: ["https://sherrill.house.gov/media/press-releases/sherrill-calls-for-investigations"],
    },
    {
      id: "coi-003",
      company: "Tesla",
      description: "DOGE cut agencies that regulate Tesla (NHTSA, EPA) while Tesla faced safety probes",
      severity: "critical",
      contractValue: "$38B+ total government funding across Musk companies",
      details: "DOGE made cuts at NHTSA (which investigates Tesla autopilot crashes), EPA (which regulates Tesla's environmental compliance and provides EV credits), and DOT. The State Department briefly proposed spending $400M on armored Tesla vehicles before backing down after public outcry.",
      sources: ["https://www.motherjones.com/politics/2025/02/elon-musk-doge-federal-contracts-conflict-interest/"],
    },
    {
      id: "coi-004",
      company: "Starlink / X",
      description: "Starlink installed in White House; DOGE reviewed telecom contracts",
      severity: "high",
      details: "Musk's Starlink satellite internet service was installed in the White House while he led DOGE, which was reviewing government telecom and technology contracts. Critics warned of vendor lock-in similar to past Microsoft deals. X (Twitter) also benefited from reduced FTC/SEC oversight.",
      sources: ["https://www.theguardian.com/technology/2025/mar/25/doge-musk-spacex-starlink-contracts"],
    },
    {
      id: "coi-005",
      company: "Neuralink",
      description: "DOGE accessed FDA while Neuralink sought regulatory approval",
      severity: "high",
      details: "Neuralink, Musk's brain-computer interface company, was seeking FDA approval for human trials while DOGE teams had access to FDA systems and reviewed health agency operations.",
      sources: ["https://www.lemonde.fr/en/pixels/article/2025/03/09/behind-musk-s-doge-conflicts-of-interest"],
    },
    {
      id: "coi-006",
      company: "DOGE Staff (23+ members)",
      description: "At least 23 DOGE members made cuts at agencies regulating their own industries",
      severity: "critical",
      details: "ProPublica identified over 100 DOGE members, of whom at least 23 made cuts at agencies that regulated industries where they had personal financial interests. Roughly 40 affiliates were tied directly to Musk.",
      sources: ["https://en.wikipedia.org/wiki/Department_of_Government_Efficiency"],
    },
  ],
  lawsuits: [
    {
      id: "law-001",
      title: "Alliance for Retired Americans v. Bessent",
      court: "U.S. District Court, D.C.",
      filedDate: "2025-02-03",
      status: "active",
      description: "Seeking to block DOGE access to Treasury databases containing sensitive personal data including Social Security numbers and payment information.",
      sources: ["https://www.congress.gov/crs-product/LSB11370"],
    },
    {
      id: "law-002",
      title: "New Mexico et al. v. Musk (14-State Coalition)",
      court: "Federal District Court",
      filedDate: "2025-02-22",
      status: "active",
      description: "14 state attorneys general challenging DOGE's authority to slash federal spending. Court allowed the case to proceed in May 2025.",
      outcome: "Motion to dismiss denied; case proceeding",
      sources: ["https://www.reuters.com/world/us/us-judge-allows-states-lawsuit-against-doge-proceed-2025-05-27/"],
    },
    {
      id: "law-003",
      title: "USAID Employees v. Musk / State Department",
      court: "Federal District Court",
      filedDate: "2025-03-01",
      status: "active",
      description: "Anonymous USAID employees suing over unlawful dismantlement of USAID. Judge ordered Musk to sit for deposition in February 2026.",
      outcome: "Musk ordered to be deposed (Feb 2026)",
      sources: ["https://www.axios.com/2026/02/05/state-department-elon-musk-doge"],
    },
    {
      id: "law-004",
      title: "Privacy Act Lawsuits (Consolidated)",
      court: "U.S. District Court, D.C. (Judge Jia M. Cobb)",
      filedDate: "2025-02-04",
      status: "active",
      description: "Multiple consolidated cases (Public Citizen, APHA, Lentini, National Security Counselors) challenging DOGE's access to personal data at federal agencies in violation of the Privacy Act.",
      sources: ["https://www.congress.gov/crs-product/LSB11370"],
    },
    {
      id: "law-005",
      title: "SSA Data Access TRO",
      court: "Federal District Court",
      filedDate: "2025-03-15",
      status: "ruling_issued",
      description: "Court issued TRO blocking DOGE access to Social Security data. Later revealed DOGE members circumvented IT rules and improperly shared private records even after the order.",
      outcome: "TRO granted March 20, 2025; DOGE found to have violated order",
      sources: ["https://www.npr.org/2026/01/23/nx-s1-5684185/doge-data-social-security-privacy"],
    },
  ],
  affectedAgencies: [
    {
      name: "U.S. Agency for International Development",
      abbreviation: "USAID",
      workersAffected: 10000,
      budgetImpact: "$40B+ in aid programs disrupted",
      keyActions: [
        "Nearly all staff placed on leave or fired",
        "World's largest humanitarian aid org effectively shut down",
        "Global aid programs disrupted in dozens of countries",
        "Ongoing legal battle; Musk ordered deposed in 2026",
      ],
      status: "severely_cut",
    },
    {
      name: "Consumer Financial Protection Bureau",
      abbreviation: "CFPB",
      workersAffected: 200,
      keyActions: [
        "~200 workers cut, most non-probationary",
        "Consumer protection functions severely impaired",
        "Data security program declared 'ineffective' by IG",
        "Personal financial data of millions put at risk",
      ],
      status: "severely_cut",
    },
    {
      name: "General Services Administration",
      abbreviation: "GSA",
      workersAffected: 3000,
      keyActions: [
        "Thousands fired in early 2025",
        "Hundreds asked to return by September 2025",
        "Building management and procurement disrupted",
      ],
      status: "partially_restored",
    },
    {
      name: "Department of Health and Human Services",
      abbreviation: "HHS",
      workersAffected: 10000,
      keyActions: [
        "Mass firing of probationary employees",
        "Bird flu response team fired then rehired",
        "Public health surveillance capacity degraded",
      ],
      status: "partially_cut",
    },
    {
      name: "Department of Education",
      abbreviation: "ED",
      workersAffected: 1300,
      keyActions: [
        "Significant staff reductions",
        "Student loan servicing disrupted",
        "Plans to dismantle department entirely",
      ],
      status: "severely_cut",
    },
    {
      name: "Internal Revenue Service",
      abbreviation: "IRS",
      workersAffected: 7000,
      keyActions: [
        "Thousands of employees cut",
        "Tax enforcement capacity reduced",
        "Customer service degraded",
      ],
      status: "partially_cut",
    },
    {
      name: "Environmental Protection Agency",
      abbreviation: "EPA",
      workersAffected: 2000,
      keyActions: [
        "Staff reductions across enforcement divisions",
        "SpaceX had active EPA violation ($148K penalty) during cuts",
        "Environmental monitoring reduced",
      ],
      status: "partially_cut",
    },
    {
      name: "Social Security Administration",
      abbreviation: "SSA",
      workersAffected: 3000,
      keyActions: [
        "DOGE gained access to sensitive payment data",
        "Court ordered data access blocked",
        "DOGE members violated court order",
        "Wait times for benefits increased",
      ],
      status: "targeted",
    },
    {
      name: "Department of Energy",
      abbreviation: "DOE",
      workersAffected: 2500,
      keyActions: [
        "National laboratory staff reduced",
        "Clean energy programs cut",
        "Nuclear security workforce affected",
      ],
      status: "partially_cut",
    },
    {
      name: "Department of Veterans Affairs",
      abbreviation: "VA",
      workersAffected: 5000,
      keyActions: [
        "Healthcare workers affected",
        "Veteran service wait times increased",
        "Benefits processing delays",
      ],
      status: "partially_cut",
    },
  ],
  staff: [
    {
      id: "staff-001",
      name: "Vivek Ramaswamy",
      role: "Co-Leader (departed)",
      age: 39,
      background: "Entrepreneur, former 2024 Republican presidential candidate, biotech entrepreneur",
      previousEmployer: ["Roivant Sciences (founder)", "Strive Asset Management (founder)"],
      tenure: {
        start: "2025-01-20",
        end: "2025-01-21",
      },
      notableActions: [
        "Co-appointed with Musk to lead DOGE",
        "Left within 24 hours of Trump's inauguration",
        "Departed to run for Ohio governor",
      ],
      controversies: [
        "Friction with Musk and other DOGE leadership over competing visions",
        "Left after stating American work culture 'venerated mediocrity over excellence'",
        "MAGA supporters' backlash contributed to departure",
        "Conflicting focus between DOGE duties and political ambitions",
      ],
      sources: [
        "https://www.axios.com/2025/01/20/vivek-ramaswamy-leaving-doge-ohio-governor",
        "https://www.theguardian.com/us-news/2025/jan/21/vivek-ramaswamy-quits-doge-elon-musk",
        "https://en.wikipedia.org/wiki/Vivek_Ramaswamy",
      ],
    },
    {
      id: "staff-002",
      name: "Akash Bobba",
      role: "Software Engineer",
      age: 21,
      background: "UC Berkeley student (Management, Entrepreneurship, and Technology program), former tech intern",
      previousEmployer: ["Meta (intern)", "Palantir (intern)", "Bridgewater Associates (intern)"],
      tenure: {
        start: "2025-01-20",
      },
      notableActions: [
        "Part of 6-person 'DOGE kids' team tasked with accessing government systems",
        "Gained access to Treasury Department systems",
      ],
      controversies: [
        "One of youngest DOGE members (21) given access to sensitive federal data",
        "Fast-tracked into government role unvetted",
      ],
      sources: [
        "https://www.ndtv.com/world-news/meet-akash-bobba-indian-origin-engineer-with-key-role-in-elon-musks-doge-7629644",
        "https://www.newindianexpress.com/world/2025/Feb/04/young-engineers-in-elon-musks-doge-agency-spark-backlash",
      ],
    },
    {
      id: "staff-003",
      name: "Edward Coristine",
      role: "Software Engineer",
      age: 19,
      background: "Northeastern University student from New Canaan, Connecticut",
      previousEmployer: ["Previous internships at tech companies"],
      tenure: {
        start: "2025-01-20",
      },
      notableActions: [
        "Youngest member of the 'DOGE kids' team",
        "Tasked with gaining access to government systems including Treasury",
      ],
      controversies: [
        "At 19, youngest DOGE member given access to sensitive federal data",
        "Fast-tracked into role without standard security clearance vetting",
      ],
      sources: [
        "https://www.ctpost.com/connecticut/article/edward-coristine-doge-elon-musk-new-canaan-20149280.php",
        "https://www.thedailybeast.com/the-doge-musketeers-the-secret-team-elon-wants-to-keep-in-the-shadows/",
      ],
    },
    {
      id: "staff-004",
      name: "Luke Farritor",
      role: "Software Engineer",
      age: 23,
      background: "University of Nebraska dropout, former SpaceX intern, Thiel Fellow",
      previousEmployer: ["SpaceX (intern)", "Nat Friedman (worked for Silicon Valley entrepreneur)"],
      tenure: {
        start: "2025-01-20",
      },
      notableActions: [
        "Part of 'DOGE kids' team accessing government systems",
      ],
      controversies: [
        "Dropped out of college to work in tech",
        "Fast-tracked into sensitive government role",
      ],
      conflictOfInterest: true,
      sources: [
        "https://www.moneycontrol.com/world/doge-squad-meet-the-six-young-engineers-in-elon-musk-s-secretive-unit-article-12975364.html",
        "https://www.lemonde.fr/en/pixels/article/2025/02/07/who-are-the-doge-kids",
      ],
    },
    {
      id: "staff-005",
      name: "Gautier Cole Killian",
      role: "Software Engineer",
      age: 24,
      background: "Recent college graduate or young professional",
      tenure: {
        start: "2025-01-20",
      },
      notableActions: [
        "Part of 'DOGE kids' team",
      ],
      sources: [
        "https://www.foxnews.com/politics/meet-young-team-software-engineers-slashing-government-waste-doge-report",
      ],
    },
    {
      id: "staff-006",
      name: "Gavin Kliger",
      role: "Software Engineer",
      age: 24,
      background: "Young software engineer",
      tenure: {
        start: "2025-01-20",
      },
      notableActions: [
        "Part of 'DOGE kids' team",
      ],
      controversies: [
        "Reportedly coerced Consumer Financial Protection Bureau staff into a 36-hour shift (May 2025)",
      ],
      sources: [
        "https://en.wikipedia.org/wiki/Network_of_the_Department_of_Government_Efficiency",
        "https://www.foxnews.com/politics/meet-young-team-software-engineers-slashing-government-waste-doge-report",
      ],
    },
    {
      id: "staff-007",
      name: "Ethan Shaotran",
      role: "Software Engineer",
      age: 22,
      background: "Harvard University senior (as of September 2024)",
      tenure: {
        start: "2025-01-20",
      },
      notableActions: [
        "Part of 'DOGE kids' team accessing government systems",
      ],
      controversies: [
        "Still a college student when given access to sensitive federal data",
      ],
      sources: [
        "https://www.thedailybeast.com/the-doge-musketeers-the-secret-team-elon-wants-to-keep-in-the-shadows/",
      ],
    },
    {
      id: "staff-008",
      name: "Marko Elez",
      role: "Software Engineer",
      age: 25,
      background: "Former SpaceX, X (Twitter), and xAI engineer",
      previousEmployer: ["SpaceX", "X (Twitter)", "Starlink", "xAI"],
      tenure: {
        start: "2025-01-20",
        end: "2025-02-07",
      },
      notableActions: [
        "Assigned to Treasury Department and Department of Labor",
        "Gained access to Treasury payment systems",
      ],
      controversies: [
        "Violated Treasury policy by emailing unencrypted spreadsheet with personal information",
        "Resigned after racist social media posts were exposed by Wall Street Journal",
        "Court restricted his ability to share Treasury data",
        "Elon Musk promised to rehire him after resignation",
        "Later found working at xAI after DOGE resignation",
      ],
      conflictOfInterest: true,
      sources: [
        "https://apnews.com/article/trump-doge-marko-elez-musk-vance-racist-posts-959272aca0eece7385cdbc470930bf37",
        "https://en.wikipedia.org/wiki/Marko_Elez",
        "https://www.theguardian.com/us-news/2025/feb/07/musk-doge-staffer-quits",
        "https://uk.pcmag.com/security/157136/doge-staffer-violated-treasury-department-data-sharing-policies",
      ],
    },
    {
      id: "staff-009",
      name: "Tom Krause",
      role: "Senior Advisor",
      background: "CEO of Cloud Software Group Inc.",
      previousEmployer: ["Cloud Software Group (CEO)"],
      tenure: {
        start: "2025-02-04",
      },
      notableActions: [
        "Brought into Treasury Department via DOGE",
      ],
      sources: [
        "https://www.bloomberg.com/news/articles/2025-02-04/us-treasury-brings-in-two-members-from-musk-s-doge-team",
      ],
    },
  ],
};
