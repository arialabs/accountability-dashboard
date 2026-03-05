import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CommitteeMemberships from "./CommitteeMemberships";

describe("CommitteeMemberships", () => {
  const mockCommittees = [
    {
      name: "Ways and Means Committee",
      role: "Chair" as const,
      subcommittees: ["Subcommittee on Trade", "Subcommittee on Health"],
    },
    {
      name: "Budget Committee",
      role: "Member" as const,
    },
    {
      name: "Judiciary Committee",
      role: "Ranking Member" as const,
    },
  ];

  it("renders committee memberships title", () => {
    render(<CommitteeMemberships committees={mockCommittees} />);
    expect(screen.getByText("Committee Memberships")).toBeInTheDocument();
  });

  it("displays all committee names", () => {
    render(<CommitteeMemberships committees={mockCommittees} />);

    expect(screen.getByText("Ways and Means Committee")).toBeInTheDocument();
    expect(screen.getByText("Budget Committee")).toBeInTheDocument();
    expect(screen.getByText("Judiciary Committee")).toBeInTheDocument();
  });

  it("shows committee roles", () => {
    render(<CommitteeMemberships committees={mockCommittees} />);

    expect(screen.getByText("Chair")).toBeInTheDocument();
    expect(screen.getByText("Member")).toBeInTheDocument();
    expect(screen.getByText("Ranking Member")).toBeInTheDocument();
  });

  it("displays subcommittees when provided", () => {
    render(<CommitteeMemberships committees={mockCommittees} />);

    expect(screen.getByText("Subcommittee on Trade")).toBeInTheDocument();
    expect(screen.getByText("Subcommittee on Health")).toBeInTheDocument();
  });

  it("highlights leadership positions with special styling", () => {
    const { container } = render(
      <CommitteeMemberships committees={mockCommittees} />
    );

    // Check for blue background on leadership positions
    const leadershipCards = container.querySelectorAll(
      ".bg-blue-50.border-blue-200"
    );
    expect(leadershipCards.length).toBeGreaterThan(0);
  });

  it("renders nothing when no committees", () => {
    const { container } = render(<CommitteeMemberships committees={[]} />);
    // Component returns null when no committees — no content rendered
    expect(container).toBeEmptyDOMElement();
  });
});
