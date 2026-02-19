import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import VotesPage from "./page";

// Mock the key votes data
vi.mock("@/data/key-votes.json", () => ({
  default: [
    {
      id: "119-House-1",
      congress: 119,
      chamber: "House",
      rollnumber: 1,
      date: "2025-01-20",
      bill: "H.R. 1",
      title: "Test Healthcare Bill",
      description: "A bill about healthcare",
      category: "Healthcare",
      yea_count: 220,
      nay_count: 210,
      result: "Passed",
    },
    {
      id: "119-Senate-1",
      congress: 119,
      chamber: "Senate",
      rollnumber: 1,
      date: "2025-01-21",
      bill: "S. 1",
      title: "Test Climate Bill",
      description: "A bill about climate",
      category: "Climate & Environment",
      yea_count: 45,
      nay_count: 55,
      result: "Failed",
    },
  ],
}));

describe("VotesPage", () => {
  it("renders the page title", () => {
    render(<VotesPage />);
    expect(screen.getByText("Key Congressional Votes")).toBeInTheDocument();
  });

  it("shows vote statistics", () => {
    render(<VotesPage />);
    expect(screen.getByText("Key Votes Tracked")).toBeInTheDocument();
    expect(screen.getByText("House Votes")).toBeInTheDocument();
    expect(screen.getByText("Senate Votes")).toBeInTheDocument();
  });

  it("displays vote cards", () => {
    render(<VotesPage />);
    // Bill numbers may have colon appended in component, use regex
    expect(screen.getByText(/H\.R\. 1/)).toBeInTheDocument();
    expect(screen.getByText("Test Healthcare Bill")).toBeInTheDocument();
    expect(screen.getByText(/S\. 1/)).toBeInTheDocument();
  });

  it("shows vote results", () => {
    render(<VotesPage />);
    expect(screen.getAllByText("Passed")[0]).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("shows category tags", () => {
    render(<VotesPage />);
    expect(screen.getAllByText("Healthcare")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Climate & Environment")[0]).toBeInTheDocument();
  });

  it("has a link back to dashboard", () => {
    render(<VotesPage />);
    const backLink = screen.getByText("← Back to Dashboard");
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("credits VoteView as data source", () => {
    render(<VotesPage />);
    expect(screen.getByText("VoteView")).toBeInTheDocument();
  });
});
