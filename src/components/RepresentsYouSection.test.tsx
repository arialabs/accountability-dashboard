import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RepresentsYouSection from "./RepresentsYouSection";
import type { ConstituentAlignmentResult } from "@/lib/constituent-alignment";

const mockAlignment: ConstituentAlignmentResult = {
  bioguideId: "C001120",
  state: "TX",
  overallScore: 33,
  totalVotesScored: 3,
  totalVotesAligned: 1,
  policies: [
    {
      policyKey: "aca_protection",
      label: "Protect ACA / Pre-existing Conditions",
      category: "Healthcare",
      description: "Maintain ACA protections",
      source: "KFF Health Tracking Poll 2023",
      stateSupport: 66,
      nationalSupport: 75,
      votesFound: [
        {
          voteId: "119-House-348",
          bill: "HR6703",
          shortLabel: "Lower Health Care Premiums Act",
          memberVote: "Yea",
          proConstituentVote: "Nay",
          aligned: false,
          explanation: "Repeals ACA premium subsidies",
        },
      ],
      aligned: false,
    },
    {
      policyKey: "government_transparency",
      label: "Government Ethics & Transparency",
      category: "Government Ethics",
      description: "Support stronger ethics rules",
      source: "Pew Research Center 2023",
      stateSupport: 77,
      nationalSupport: 82,
      votesFound: [
        {
          voteId: "119-House-288",
          bill: "HR4405",
          shortLabel: "Epstein Files Transparency Act",
          memberVote: "Yea",
          proConstituentVote: "Yea",
          aligned: true,
          explanation: "Release Epstein investigation documents",
        },
      ],
      aligned: true,
    },
    {
      policyKey: "climate_action",
      label: "Federal Climate Legislation",
      category: "Climate & Environment",
      description: "Support federal climate action",
      source: "Yale Climate Opinion Maps 2024",
      stateSupport: 60,
      nationalSupport: 70,
      votesFound: [],
      aligned: null, // No votes found
    },
  ],
};

describe("RepresentsYouSection", () => {
  it("renders the section heading", () => {
    render(
      <RepresentsYouSection alignment={mockAlignment} memberName="Dan Crenshaw" />
    );
    expect(screen.getByText("Represents You?")).toBeInTheDocument();
  });

  it("displays the overall alignment score", () => {
    render(
      <RepresentsYouSection alignment={mockAlignment} memberName="Dan Crenshaw" />
    );
    expect(screen.getByText("33%")).toBeInTheDocument();
  });

  it("shows scored policies but not unscored ones", () => {
    render(
      <RepresentsYouSection alignment={mockAlignment} memberName="Dan Crenshaw" />
    );
    // Scored policies should appear
    expect(
      screen.getByText("Protect ACA / Pre-existing Conditions")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Government Ethics & Transparency")
    ).toBeInTheDocument();

    // Unscored policy (no votes) should NOT appear
    expect(
      screen.queryByText("Federal Climate Legislation")
    ).not.toBeInTheDocument();
  });

  it("shows aligned and misaligned badges", () => {
    render(
      <RepresentsYouSection alignment={mockAlignment} memberName="Dan Crenshaw" />
    );
    expect(screen.getByText("Aligned")).toBeInTheDocument();
    expect(screen.getByText("Misaligned")).toBeInTheDocument();
  });

  it("shows state-level support percentages", () => {
    render(
      <RepresentsYouSection alignment={mockAlignment} memberName="Dan Crenshaw" />
    );
    expect(screen.getByText(/66% of TX residents support this/)).toBeInTheDocument();
    expect(screen.getByText(/77% of TX residents support this/)).toBeInTheDocument();
  });

  it("shows individual vote details", () => {
    render(
      <RepresentsYouSection alignment={mockAlignment} memberName="Dan Crenshaw" />
    );
    expect(screen.getByText("Lower Health Care Premiums Act")).toBeInTheDocument();
    expect(screen.getByText("Epstein Files Transparency Act")).toBeInTheDocument();
  });

  it("returns null when no scored policies exist", () => {
    const emptyAlignment: ConstituentAlignmentResult = {
      ...mockAlignment,
      policies: [
        {
          ...mockAlignment.policies[2], // climate_action with no votes
        },
      ],
    };

    const { container } = render(
      <RepresentsYouSection alignment={emptyAlignment} memberName="Dan Crenshaw" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows methodology note", () => {
    render(
      <RepresentsYouSection alignment={mockAlignment} memberName="Dan Crenshaw" />
    );
    expect(
      screen.getByText(/Constituent preferences from nationally representative polls/)
    ).toBeInTheDocument();
  });
});
