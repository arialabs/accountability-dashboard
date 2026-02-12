-- Executive Branch Accountability Schema Extension
-- To be merged with main schema.sql

-- Presidential promises and policy positions
CREATE TABLE IF NOT EXISTS presidential_promises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    president TEXT NOT NULL,                -- e.g., "Donald Trump"
    promise_text TEXT NOT NULL,
    category TEXT,                          -- e.g., "Immigration", "Economy", "Healthcare"
    subcategory TEXT,                       -- More specific categorization
    date_made DATE,                         -- When the promise was made
    source_url TEXT,                        -- Where it was stated (rally, debate, etc.)
    source_type TEXT,                       -- "campaign_speech", "debate", "interview", etc.
    
    -- Status tracking
    status TEXT DEFAULT 'pending',          -- "pending", "in_progress", "achieved", "broken", "modified"
    status_updated_at DATETIME,
    
    -- Metadata
    priority TEXT,                          -- "high", "medium", "low" - how often mentioned
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cabinet members (extends/replaces data/cabinet.json eventually)
CREATE TABLE IF NOT EXISTS cabinet_members (
    id TEXT PRIMARY KEY,                    -- e.g., "secretary-of-state"
    name TEXT NOT NULL,
    position TEXT NOT NULL,                 -- "Secretary of State"
    department TEXT NOT NULL,               -- "Department of State"
    
    -- Appointment details
    appointed_date DATE,
    confirmed_date DATE,
    senate_vote TEXT,                       -- e.g., "99-0"
    term_end_date DATE,                     -- If they leave early
    
    -- Profile
    bio TEXT,
    photo_url TEXT,
    prior_positions TEXT,                   -- JSON array of previous roles
    net_worth TEXT,
    
    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Actions taken by cabinet members (executive orders, policy decisions, public statements)
CREATE TABLE IF NOT EXISTS cabinet_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cabinet_member_id TEXT NOT NULL REFERENCES cabinet_members(id),
    
    -- Action details
    action_type TEXT NOT NULL,              -- "executive_order", "regulation", "speech", "testimony", "policy_decision"
    title TEXT NOT NULL,
    description TEXT,
    summary TEXT,                           -- Short summary for display
    
    -- Timing
    action_date DATE NOT NULL,
    announced_date DATE,
    
    -- Source
    source_url TEXT,
    source_type TEXT,                       -- "federal_register", "news", "whitehouse", "department_website"
    document_number TEXT,                   -- Federal Register document number if applicable
    
    -- Impact
    impact_score INTEGER,                   -- 1-10 significance rating
    controversial BOOLEAN DEFAULT FALSE,
    
    -- Relations
    related_promise_ids TEXT,               -- JSON array of promise IDs this relates to
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Alignment scores between cabinet members and presidential promises
CREATE TABLE IF NOT EXISTS alignment_scores (
    cabinet_member_id TEXT NOT NULL REFERENCES cabinet_members(id),
    promise_id INTEGER REFERENCES presidential_promises(id),
    
    -- Scoring
    alignment_score INTEGER NOT NULL,       -- -100 to +100 (-100=directly opposes, 0=neutral, 100=fully aligned)
    confidence_level TEXT DEFAULT 'medium', -- "low", "medium", "high" - how confident we are in this score
    
    -- Explanation
    rationale TEXT,                         -- Why this score was given
    supporting_action_ids TEXT,             -- JSON array of cabinet_action IDs that informed this score
    
    -- Metadata
    calculated_at DATETIME NOT NULL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (cabinet_member_id, promise_id)
);

-- Overall alignment metrics per cabinet member
CREATE TABLE IF NOT EXISTS cabinet_member_stats (
    cabinet_member_id TEXT PRIMARY KEY REFERENCES cabinet_members(id),
    
    -- Overall alignment
    overall_alignment_score REAL,           -- Average of all promise alignments
    alignment_trend TEXT,                   -- "improving", "stable", "declining"
    
    -- Activity metrics
    total_actions INTEGER DEFAULT 0,
    recent_actions_30d INTEGER DEFAULT 0,
    executive_orders_count INTEGER DEFAULT 0,
    public_statements_count INTEGER DEFAULT 0,
    
    -- Promise tracking
    promises_aligned INTEGER DEFAULT 0,
    promises_conflicted INTEGER DEFAULT 0,
    promises_neutral INTEGER DEFAULT 0,
    
    -- Metadata
    last_action_date DATE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Executive orders (specific subset of cabinet_actions for easier tracking)
CREATE TABLE IF NOT EXISTS executive_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number INTEGER,                   -- Executive Order number
    title TEXT NOT NULL,
    summary TEXT,
    full_text TEXT,                         -- Full text if available
    
    signed_date DATE NOT NULL,
    president TEXT NOT NULL,
    
    -- Federal Register
    federal_register_number TEXT,
    federal_register_url TEXT,
    
    -- Categorization
    category TEXT,                          -- "Immigration", "Environment", "Trade", etc.
    affected_departments TEXT,              -- JSON array of departments
    related_cabinet_members TEXT,           -- JSON array of cabinet member IDs
    related_promise_ids TEXT,               -- JSON array of promise IDs
    
    -- Impact
    significance TEXT,                      -- "major", "moderate", "minor"
    controversial BOOLEAN DEFAULT FALSE,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_promises_category ON presidential_promises(category);
CREATE INDEX IF NOT EXISTS idx_promises_status ON presidential_promises(status);
CREATE INDEX IF NOT EXISTS idx_promises_president ON presidential_promises(president);

CREATE INDEX IF NOT EXISTS idx_cabinet_actions_member ON cabinet_actions(cabinet_member_id);
CREATE INDEX IF NOT EXISTS idx_cabinet_actions_date ON cabinet_actions(action_date);
CREATE INDEX IF NOT EXISTS idx_cabinet_actions_type ON cabinet_actions(action_type);

CREATE INDEX IF NOT EXISTS idx_alignment_member ON alignment_scores(cabinet_member_id);
CREATE INDEX IF NOT EXISTS idx_alignment_promise ON alignment_scores(promise_id);

CREATE INDEX IF NOT EXISTS idx_exec_orders_date ON executive_orders(signed_date);
CREATE INDEX IF NOT EXISTS idx_exec_orders_category ON executive_orders(category);
