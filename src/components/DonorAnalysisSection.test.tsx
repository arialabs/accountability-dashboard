import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DonorAnalysisSection from "./DonorAnalysisSection";
import type { CampaignFinance } from "@/lib/types";

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

  it("renders the section title", () => {
    render(<DonorAnalysisSection finance={mockFinance} />);
    expect(screen.getByText("💰 Campaign Finance")).toBeInTheDocument();
  });

  it("displays funding source labels", () => {
    render(<DonorAnalysisSection finance={mockFinance} />);
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

  it("displays percentage breakdown", () => {
    render(<DonorAnalysisSection finance={mockFinance} />);
    expect(screen.getByText("42.9%")).toBeInTheDocument();
    expect(screen.getByText("32.5%")).toBeInTheDocument();
  });

  it("renders pie chart", () => {
    const { container } = render(<DonorAnalysisSection finance={mockFinance} />);
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
});
