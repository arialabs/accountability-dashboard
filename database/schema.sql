-- Accountability Dashboard Schema
-- SQLite / Turso compatible

-- Members of Congress (535 total: 435 House + 100 Senate)
CREATE TABLE IF NOT EXISTS members (
    bioguide_id TEXT PRIMARY KEY,           -- Official ID (e.g., "S000033" for Bernie)
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    party TEXT NOT NULL,                    -- D, R, I
    state TEXT NOT NULL,                    -- Two-letter code
    district INTEGER,                       -- NULL for senators
    chamber TEXT NOT NULL,                  -- "house" or "senate"
    
    -- Contact & social
    website TEXT,
    twitter_handle TEXT,
    
    -- Current term info
    term_start DATE,
    term_end DATE,
    
    -- Metadata
    photo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Votes cast by members
CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bioguide_id TEXT NOT NULL REFERENCES members(bioguide_id),
    roll_call_id TEXT NOT NULL,             -- Unique vote identifier
    bill_id TEXT,                           -- Related bill if any
    vote_date DATE NOT NULL,
    vote_position TEXT NOT NULL,            -- "Yes", "No", "Not Voting", "Present"
    question TEXT,                          -- What was being voted on
    result TEXT,                            -- "Passed", "Failed"
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bioguide_id, roll_call_id)
);

-- Bills (legislation)
CREATE TABLE IF NOT EXISTS bills (
    bill_id TEXT PRIMARY KEY,               -- e.g., "hr1234-118"
    title TEXT NOT NULL,
    short_title TEXT,
    congress INTEGER NOT NULL,              -- e.g., 118
    bill_type TEXT NOT NULL,                -- "hr", "s", "hjres", etc.
    bill_number INTEGER NOT NULL,
    sponsor_bioguide_id TEXT REFERENCES members(bioguide_id),
    
    introduced_date DATE,
    latest_action TEXT,
    latest_action_date DATE,
    
    -- Status
    passed_house BOOLEAN DEFAULT FALSE,
    passed_senate BOOLEAN DEFAULT FALSE,
    became_law BOOLEAN DEFAULT FALSE,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Campaign contributions (aggregated by source)
CREATE TABLE IF NOT EXISTS contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bioguide_id TEXT NOT NULL REFERENCES members(bioguide_id),
    cycle INTEGER NOT NULL,                 -- Election cycle (e.g., 2024)
    
    -- Contributor info
    contributor_name TEXT NOT NULL,         -- PAC name, industry, or individual
    contributor_type TEXT NOT NULL,         -- "pac", "industry", "individual"
    
    -- Money
    total_amount REAL NOT NULL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bioguide_id, cycle, contributor_name, contributor_type)
);

-- Aggregated stats per member (computed daily)
CREATE TABLE IF NOT EXISTS member_stats (
    bioguide_id TEXT PRIMARY KEY REFERENCES members(bioguide_id),
    
    -- Voting stats
    total_votes INTEGER DEFAULT 0,
    votes_with_party INTEGER DEFAULT 0,
    votes_against_party INTEGER DEFAULT 0,
    missed_votes INTEGER DEFAULT 0,
    party_alignment_pct REAL,               -- 0-100
    missed_votes_pct REAL,                  -- 0-100
    
    -- Financial stats
    total_raised REAL DEFAULT 0,
    pac_money_pct REAL,                     -- % from PACs
    small_donor_pct REAL,                   -- % from small donors
    
    -- Effectiveness stats
    bills_sponsored INTEGER DEFAULT 0,
    bills_passed INTEGER DEFAULT 0,
    
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_votes_bioguide ON votes(bioguide_id);
CREATE INDEX IF NOT EXISTS idx_votes_date ON votes(vote_date);
CREATE INDEX IF NOT EXISTS idx_bills_sponsor ON bills(sponsor_bioguide_id);
CREATE INDEX IF NOT EXISTS idx_contributions_bioguide ON contributions(bioguide_id);
CREATE INDEX IF NOT EXISTS idx_members_state ON members(state);
CREATE INDEX IF NOT EXISTS idx_members_party ON members(party);

-- USASpending agency budget totals by fiscal year
CREATE TABLE IF NOT EXISTS agency_budget_totals (
    agency_slug TEXT NOT NULL,
    agency_name TEXT NOT NULL,
    fiscal_year INTEGER NOT NULL,
    total_obligations REAL NOT NULL,
    total_outlays REAL NOT NULL,
    total_budget_authority REAL NOT NULL,
    yoy_change_pct REAL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (agency_slug, fiscal_year)
);

-- USASpending program-level changes
CREATE TABLE IF NOT EXISTS agency_program_changes (
    agency_slug TEXT NOT NULL,
    fiscal_year INTEGER NOT NULL,
    program_name TEXT NOT NULL,
    current_amount REAL NOT NULL,
    previous_amount REAL NOT NULL,
    change_amount REAL NOT NULL,
    change_pct REAL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (agency_slug, fiscal_year, program_name)
);

-- USASpending top awards (contracts + grants)
CREATE TABLE IF NOT EXISTS agency_awards (
    agency_slug TEXT NOT NULL,
    award_id TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    amount REAL NOT NULL,
    award_type TEXT NOT NULL,
    award_type_label TEXT NOT NULL,
    awarding_agency TEXT NOT NULL,
    awarding_sub_agency TEXT,
    action_date TEXT,
    description TEXT NOT NULL,
    source_url TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (agency_slug, award_id, recipient_name)
);

-- USASpending sync metadata/status log
CREATE TABLE IF NOT EXISTS usaspending_sync_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_at DATETIME NOT NULL,
    status TEXT NOT NULL,
    fiscal_year_start INTEGER NOT NULL,
    fiscal_year_end INTEGER NOT NULL,
    agencies_processed INTEGER NOT NULL,
    agencies_with_data INTEGER NOT NULL,
    awards_stored INTEGER NOT NULL,
    errors_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agency_budget_fiscal_year ON agency_budget_totals(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_program_changes_fiscal_year ON agency_program_changes(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_agency_awards_type ON agency_awards(agency_slug, award_type);
CREATE INDEX IF NOT EXISTS idx_agency_awards_action_date ON agency_awards(action_date);
