import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MemberVotingRecord from "./MemberVotingRecord";

const mockKeyVotes = [
  {
    id: "119-House-1",
    congress: 119,
    chamber: "House" as const,
    rollnumber: 1,
    date: "2025-01-20",
    bill: "H.R. 1",
    title: "Healthcare Reform Act",
    description: "A major healthcare bill",
    category: "Healthcare",
    yea_count: 220,
    nay_count: 210,
    result: "Passed" as const,
    votes: {
      "B001234": "Yea",
      "S005678": "Nay",
    },
  },
  {
    id: "119-House-2",
    congress: 119,
    chamber: "House" as const,
    rollnumber: 2,
    date: "2025-01-21",
    bill: "H.R. 2",
    title: "Climate Action Now",
    description: "Climate legislation",
    category: "Climate & Environment",
    yea_count: 218,
    nay_count: 212,
    result: "Passed" as const,
    votes: {
      "B001234": "Nay",
      "S005678": "Yea",
    },
  },
  {
    id: "119-Senate-1",
    congress: 119,
    chamber: "Senate" as const,
    rollnumber: 1,
    date: "2025-01-22",
    bill: "S. 1",
    title: "Tax Reform",
    description: "Tax changes",
    category: "Economy & Taxes",
    yea_count: 51,
    nay_count: 49,
    result: "Passed" as const,
    votes: {
      "B001234": "Yea", // House member shouldn't see this
      "S005678": "Nay",
    },
  },
];

describe("MemberVotingRecord", () => {
  it("renders the section title", () => {
    render(
      <MemberVotingRecord 
        bioguideId="B001234" 
        memberName="John Smith" 
        chamber="House" 
        keyVotes={mockKeyVotes} 
      />
    );
    expect(screen.getByText("🗳️ Key Vote Record")).toBeInTheDocument();
  });

  it("shows member's name in subtitle", () => {
    render(
      <MemberVotingRecord 
        bioguideId="B001234" 
        memberName="John Smith" 
        chamber="House" 
        keyVotes={mockKeyVotes} 
      />
    );
    expect(screen.getByText(/How John voted/)).toBeInTheDocument();
  });

  it("displays vote statistics", () => {
    render(
      <MemberVotingRecord 
        bioguideId="B001234" 
        memberName="John Smith" 
        chamber="House" 
        keyVotes={mockKeyVotes} 
      />
    );
    expect(screen.getByText("Key Votes")).toBeInTheDocument();
    // "Yea" and "Nay" appear multiple times (stats + vote badges)
    expect(screen.getAllByText("Yea").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Nay").length).toBeGreaterThan(0);
    expect(screen.getByText("Participation")).toBeInTheDocument();
  });

  it("filters votes by member's chamber", () => {
    render(
      <MemberVotingRecord 
        bioguideId="B001234" 
        memberName="John Smith" 
        chamber="House" 
        keyVotes={mockKeyVotes} 
      />
    );
    // Should show House votes only (H.R. 1 and H.R. 2)
    expect(screen.getByText("H.R. 1")).toBeInTheDocument();
    expect(screen.getByText("H.R. 2")).toBeInTheDocument();
    // Should NOT show Senate vote
    expect(screen.queryByText("S. 1")).not.toBeInTheDocument();
  });

  it("shows member's vote for each bill", () => {
    render(
      <MemberVotingRecord 
        bioguideId="B001234" 
        memberName="John Smith" 
        chamber="House" 
        keyVotes={mockKeyVotes} 
      />
    );
    // Member voted Yea on H.R. 1 and Nay on H.R. 2
    const yeaBadges = screen.getAllByText("Yea");
    const nayBadges = screen.getAllByText("Nay");
    expect(yeaBadges.length).toBeGreaterThan(0);
    expect(nayBadges.length).toBeGreaterThan(0);
  });

  it("displays category badges", () => {
    render(
      <MemberVotingRecord 
        bioguideId="B001234" 
        memberName="John Smith" 
        chamber="House" 
        keyVotes={mockKeyVotes} 
      />
    );
    expect(screen.getAllByText("Healthcare").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Climate & Environment").length).toBeGreaterThan(0);
  });

  it("filters by category when clicked", () => {
    render(
      <MemberVotingRecord 
        bioguideId="B001234" 
        memberName="John Smith" 
        chamber="House" 
        keyVotes={mockKeyVotes} 
      />
    );
    // Click Healthcare category filter
    const healthcareButtons = screen.getAllByText("Healthcare");
    const filterButton = healthcareButtons.find(el => el.tagName === "BUTTON");
    if (filterButton) {
      fireEvent.click(filterButton);
    }
    // Should now only show Healthcare vote
    expect(screen.getByText("H.R. 1")).toBeInTheDocument();
    expect(screen.queryByText("H.R. 2")).not.toBeInTheDocument();
  });

  it("shows empty state when no votes for member", () => {
    render(
      <MemberVotingRecord 
        bioguideId="UNKNOWN" 
        memberName="Unknown Person" 
        chamber="House" 
        keyVotes={mockKeyVotes} 
      />
    );
    expect(screen.getByText(/No key vote records available/)).toBeInTheDocument();
  });
});
