import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import VotingCharts from "./VotingCharts";
import { Member } from "@/lib/data";

const mockMember: Member = {
  bioguide_id: "T001234",
  first_name: "Test",
  last_name: "Member",
  full_name: "Test Member",
  party: "D",
  state: "NY",
  district: 1,
  chamber: "house",
  photo_url: null,
  bills_sponsored: 5,
  bills_cosponsored: 10,
  committees: [],
  party_alignment_pct: 87,
  ideology_score: -0.456,
  votes_cast: 42,
};

describe("VotingCharts", () => {
  it("renders party alignment percentage", () => {
    render(<VotingCharts member={mockMember} />);
    expect(screen.getByText("87%")).toBeDefined();
  });

  it("renders party alignment section heading", () => {
    render(<VotingCharts member={mockMember} />);
    expect(screen.getByText("Party Alignment")).toBeDefined();
  });

  it("renders ideology spectrum section", () => {
    render(<VotingCharts member={mockMember} />);
    expect(screen.getByText("Ideology Spectrum")).toBeDefined();
  });

  it("displays DW-NOMINATE score when available", () => {
    render(<VotingCharts member={mockMember} />);
    expect(screen.getByText("-0.456")).toBeDefined();
  });

  it("shows 'not available' when ideology score is null", () => {
    const memberWithoutScore = { ...mockMember, ideology_score: null };
    render(<VotingCharts member={memberWithoutScore} />);
    expect(screen.getByText("Ideology score not available")).toBeDefined();
  });

  it("renders voting activity section", () => {
    render(<VotingCharts member={mockMember} />);
    expect(screen.getByText("Voting Activity")).toBeDefined();
  });

  it("shows correct vote count", () => {
    render(<VotingCharts member={mockMember} />);
    expect(screen.getByText("42 votes")).toBeDefined();
  });

  it("renders with Republican member", () => {
    const repMember = { ...mockMember, party: "R", ideology_score: 0.543 };
    render(<VotingCharts member={repMember} />);
    expect(screen.getByText("0.543")).toBeDefined();
  });

  it("renders with Independent member", () => {
    const indMember = { ...mockMember, party: "I" };
    render(<VotingCharts member={indMember} />);
    expect(screen.getByText("Party Alignment")).toBeDefined();
  });

  it("renders with Senate member (different vote scale)", () => {
    const senator = { ...mockMember, chamber: "senate" as const, votes_cast: 25 };
    render(<VotingCharts member={senator} />);
    expect(screen.getByText("25 votes")).toBeDefined();
  });
});
