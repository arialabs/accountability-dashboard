import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DonorAnalysisSection from "./DonorAnalysisSection";
import type { CampaignFinance } from "@/lib/types";
import type { DonorPercentilesData } from "@/lib/donor-percentiles";

/** Helper to expand the funding details section */
function expandDetails() {
  fireEvent.click(screen.getByText("Show funding details"));
}

describe("DonorAnalysisSection", () => {
  const mockFinance: CampaignFinance = {
    candidate_id: "H0OH04000",
    cycle: 2024,
    total_raised: 2800000,
    total_spent: 2500000,
    cash_on_hand: 300000,
    candidate_self_funding: 50000,
    pac_contributions: 1200000,
    pac_percentage: 42.9,
    individual_contributions: 1550000,
    large_donors: 910000,
    large_donor_percentage: 32.5,
    small_donors: 640000,
    small_donor_percentage: 22.9,
    party_contributions: 0,
    top_contributors: [],
    top_industries: [],
  };

  const mockFinanceWithIndustries: CampaignFinance = {
    ...mockFinance,
    top_industries: [
      { industry: "Finance/Securities", total: 1500000, pac_amount: 600000, individual_amount: 900000 },
      { industry: "Health", total: 900000, pac_amount: 500000, individual_amount: 400000 },
    ],
  };

  const mockPercentilesData: DonorPercentilesData = {
    generated_at: "2026-01-01T00:00:00.000Z",
    members: {
      "TEST001": {
        "Finance/Securities": {
          chamber_percentile: 89,
          chamber_label: "More than 89% of House members",
          state_rank: 1,
          state_member_count: 3,
          is_state_leader: true,
        },
        "Health": {
          chamber_percentile: 65,
          chamber_label: "More than 65% of House members",
          state_rank: 2,
          state_member_count: 3,
          is_state_leader: false,
        },
      },
    },
  };

  it("renders the section title", () => {
    render(<DonorAnalysisSection finance={mockFinance} />);
    expect(screen.getByText("💰 Campaign Finance")).toBeInTheDocument();
  });

  it("displays funding source labels after expanding details", () => {
    render(<DonorAnalysisSection finance={mockFinance} />);
    expandDetails();
    expect(screen.getByText("PAC Contributions")).toBeInTheDocument();
    expect(screen.getByText(/Large Individual Donors/)).toBeInTheDocument();
    expect(screen.getByText(/Small Individual Donors/)).toBeInTheDocument();
  });

  it("shows summary stats", () => {
    render(<DonorAnalysisSection finance={mockFinance} />);
    expect(screen.getByText("Total Raised")).toBeInTheDocument();
    expect(screen.getByText("Total Spent")).toBeInTheDocument();
  });

  it("formats currency correctly", () => {
    render(<DonorAnalysisSection finance={mockFinance} />);
    // Total raised should be $2.8M
    expect(screen.getByText("$2.8M")).toBeInTheDocument();
    // Total spent should be $2.5M
    expect(screen.getByText("$2.5M")).toBeInTheDocument();
  });

  it("displays percentage breakdown after expanding details", () => {
    render(<DonorAnalysisSection finance={mockFinance} />);
    expandDetails();
    expect(screen.getByText("42.9%")).toBeInTheDocument();
    expect(screen.getByText("32.5%")).toBeInTheDocument();
  });

  it("renders pie chart after expanding details", () => {
    const { container } = render(<DonorAnalysisSection finance={mockFinance} />);
    expandDetails();
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("shows election cycle", () => {
    render(<DonorAnalysisSection finance={mockFinance} />);
    expect(screen.getByText(/2024 Election Cycle/)).toBeInTheDocument();
  });

  it("handles null finance gracefully", () => {
    render(<DonorAnalysisSection finance={null} />);
    expect(screen.getByText(/Campaign finance data not yet available/)).toBeInTheDocument();
  });

  // ── Peer-comparison percentile tests ────────────────────────────────────────

  it("shows top industries when present after expanding details", () => {
    render(<DonorAnalysisSection finance={mockFinanceWithIndustries} />);
    expandDetails();
    expect(screen.getByText("Top Industries")).toBeInTheDocument();
    expect(screen.getByText("Finance/Securities")).toBeInTheDocument();
    expect(screen.getByText("Health")).toBeInTheDocument();
  });

  it("shows percentile context when percentilesData and memberId are provided", () => {
    render(
      <DonorAnalysisSection
        finance={mockFinanceWithIndustries}
        memberId="TEST001"
        memberChamber="house"
        memberState="Ohio"
        percentilesData={mockPercentilesData}
      />
    );
    expandDetails();
    // Should show chamber label for Finance/Securities (89th percentile)
    expect(screen.getByText("More than 89% of House members")).toBeInTheDocument();
    // Should show state leader callout
    expect(screen.getByText("Highest recipient in Ohio")).toBeInTheDocument();
    // Should show chamber label for Health (65th percentile)
    expect(screen.getByText("More than 65% of House members")).toBeInTheDocument();
    // Non-leader state rank
    expect(screen.getByText("#2 in Ohio")).toBeInTheDocument();
  });

  it("does not show percentile context when percentilesData is null", () => {
    render(
      <DonorAnalysisSection
        finance={mockFinanceWithIndustries}
        memberId="TEST001"
        memberChamber="house"
        memberState="Ohio"
        percentilesData={null}
      />
    );
    // No percentile labels should appear
    expect(screen.queryByText(/More than .* of House members/)).not.toBeInTheDocument();
  });

  it("does not show percentile context when memberId is not provided", () => {
    render(
      <DonorAnalysisSection
        finance={mockFinanceWithIndustries}
        memberChamber="house"
        memberState="Ohio"
        percentilesData={mockPercentilesData}
      />
    );
    expect(screen.queryByText(/More than .* of House members/)).not.toBeInTheDocument();
  });

  it("does not show percentile context when member has no percentile data", () => {
    render(
      <DonorAnalysisSection
        finance={mockFinanceWithIndustries}
        memberId="UNKNOWN_ID"
        memberChamber="house"
        memberState="Ohio"
        percentilesData={mockPercentilesData}
      />
    );
    expect(screen.queryByText(/More than .* of House members/)).not.toBeInTheDocument();
  });

  it("shows percentile note when percentiles are available after expanding", () => {
    render(
      <DonorAnalysisSection
        finance={mockFinanceWithIndustries}
        memberId="TEST001"
        memberChamber="house"
        memberState="Ohio"
        percentilesData={mockPercentilesData}
      />
    );
    expandDetails();
    expect(
      screen.getByText(/Percentile context compares this member to peers in the same chamber/)
    ).toBeInTheDocument();
  });
});
