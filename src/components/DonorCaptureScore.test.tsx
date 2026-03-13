import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DonorCaptureScore from "./DonorCaptureScore";
import type { ConflictOfInterest } from "@/lib/conflict-detector";
import type { CampaignFinance } from "@/lib/types";

const makeConflict = (severity: "high" | "medium" | "low"): ConflictOfInterest => ({
  industry: "pharma",
  industryDisplayName: "Pharmaceuticals",
  icon: "💊",
  donationAmount: 400000,
  voteCategory: "Healthcare",
  voteTitle: "Medicare Drug Pricing Reform Act",
  voteBill: "H.R. 3",
  voteDate: "2023-09-19",
  votePosition: "Nay",
  expectedVote: "Yea",
  benefitsIndustry: true,
  conflictSeverity: severity,
  explanation: "Voted against drug pricing reform after receiving large pharma donations.",
});

const makeFinance = (pacPct: number, smallDonorPct: number): CampaignFinance => ({
  candidate_id: "P00000001",
  cycle: 2024,
  total_raised: 5000000,
  total_spent: 4000000,
  cash_on_hand: 1000000,
  individual_contributions: 3000000,
  pac_contributions: 1500000,
  party_contributions: 0,
  candidate_self_funding: 0,
  small_donors: 1000000,
  large_donors: 2000000,
  pac_percentage: pacPct,
  small_donor_percentage: smallDonorPct,
  large_donor_percentage: 100 - pacPct - smallDonorPct,
  top_industries: [],
  top_contributors: [],
});

describe("DonorCaptureScore", () => {
  it("renders nothing when no data available", () => {
    const { container } = render(
      <DonorCaptureScore conflicts={[]} finance={null} memberName="Test Rep" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows DONOR CAPTURED when 2+ high conflicts", () => {
    const conflicts = [makeConflict("high"), makeConflict("high")];
    render(
      <DonorCaptureScore
        conflicts={conflicts}
        finance={makeFinance(20, 30)}
        memberName="John Doe"
      />
    );
    expect(screen.getByText(/DONOR CAPTURED/i)).toBeInTheDocument();
  });

  it("shows DONOR CAPTURED when PAC funding >= 60%", () => {
    render(
      <DonorCaptureScore
        conflicts={[]}
        finance={makeFinance(65, 10)}
        memberName="Jane Smith"
      />
    );
    expect(screen.getByText(/DONOR CAPTURED/i)).toBeInTheDocument();
  });

  it("shows MIXED ALLEGIANCE for 1 high conflict", () => {
    const conflicts = [makeConflict("high")];
    render(
      <DonorCaptureScore
        conflicts={conflicts}
        finance={makeFinance(20, 40)}
        memberName="Bob Jones"
      />
    );
    expect(screen.getByText(/MIXED ALLEGIANCE/i)).toBeInTheDocument();
  });

  it("shows MIXED ALLEGIANCE when PAC 30-59%", () => {
    render(
      <DonorCaptureScore
        conflicts={[]}
        finance={makeFinance(45, 20)}
        memberName="Alice Green"
      />
    );
    expect(screen.getByText(/MIXED ALLEGIANCE/i)).toBeInTheDocument();
  });

  it("shows CONSTITUENT FOCUSED when no conflicts and low PAC", () => {
    render(
      <DonorCaptureScore
        conflicts={[]}
        finance={makeFinance(15, 60)}
        memberName="Good Rep"
      />
    );
    expect(screen.getByText(/CONSTITUENT FOCUSED/i)).toBeInTheDocument();
  });

  it("shows conflict count pill", () => {
    const conflicts = [makeConflict("high"), makeConflict("medium")];
    render(
      <DonorCaptureScore
        conflicts={conflicts}
        finance={null}
        memberName="Test Rep"
      />
    );
    expect(screen.getByText(/2 conflicts detected/i)).toBeInTheDocument();
  });

  it("shows PAC funding pill when finance data available", () => {
    render(
      <DonorCaptureScore
        conflicts={[]}
        finance={makeFinance(55, 15)}
        memberName="Test Rep"
      />
    );
    expect(screen.getByText(/55% PAC funding/i)).toBeInTheDocument();
  });

  it("shows member name in description", () => {
    render(
      <DonorCaptureScore
        conflicts={[makeConflict("high"), makeConflict("high")]}
        finance={makeFinance(70, 10)}
        memberName="Senator Moneybags"
      />
    );
    expect(screen.getByText(/Senator Moneybags/)).toBeInTheDocument();
  });

  it("renders with finance data only (no conflicts)", () => {
    render(
      <DonorCaptureScore
        conflicts={[]}
        finance={makeFinance(40, 25)}
        memberName="Rep Test"
      />
    );
    expect(screen.getByLabelText("Donor Capture Score")).toBeInTheDocument();
  });

  it("shows top conflict evidence when conflicts exist", () => {
    const conflicts = [makeConflict("high")];
    render(
      <DonorCaptureScore conflicts={conflicts} finance={makeFinance(40, 20)} memberName="Rep Test" />
    );
    expect(screen.getByText(/Pharmaceuticals/)).toBeInTheDocument();
    expect(screen.getByText(/H\.R\. 3/i)).toBeInTheDocument();
  });

  it("shows 'See all N conflicts' link when more than 2", () => {
    const conflicts = [makeConflict("high"), makeConflict("medium"), makeConflict("low")];
    render(
      <DonorCaptureScore conflicts={conflicts} finance={makeFinance(40, 20)} memberName="Rep Test" />
    );
    expect(screen.getByText(/See all 3 conflicts/i)).toBeInTheDocument();
  });

  it("shows PAC-only explanation when 0 conflicts but PAC funding", () => {
    render(
      <DonorCaptureScore conflicts={[]} finance={makeFinance(35, 20)} memberName="Rep Test" />
    );
    expect(screen.getByText(/No direct conflicts detected/i)).toBeInTheDocument();
  });
});
