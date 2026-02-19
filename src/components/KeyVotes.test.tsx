import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import KeyVotes from "./KeyVotes";

const mockVotes = [
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
  },
  {
    id: "119-Senate-1",
    congress: 119,
    chamber: "Senate" as const,
    rollnumber: 1,
    date: "2025-01-21",
    bill: "S. 1",
    title: "Climate Action Now",
    description: "Climate legislation",
    category: "Climate & Environment",
    yea_count: 45,
    nay_count: 55,
    result: "Failed" as const,
  },
  {
    id: "119-House-2",
    congress: 119,
    chamber: "House" as const,
    rollnumber: 2,
    date: "2025-01-22",
    bill: "H.R. 2",
    title: "Tax Reform",
    description: "Tax changes",
    category: "Economy & Taxes",
    yea_count: 225,
    nay_count: 205,
    result: "Passed" as const,
  },
];

describe("KeyVotes", () => {
  it("renders vote cards", () => {
    render(<KeyVotes votes={mockVotes} />);
    // Bill numbers may have colon appended, use regex
    expect(screen.getByText(/H\.R\. 1/)).toBeInTheDocument();
    expect(screen.getByText("Healthcare Reform Act")).toBeInTheDocument();
  });

  it("shows vote counts", () => {
    render(<KeyVotes votes={mockVotes} />);
    expect(screen.getByText("✓ 220 Yea")).toBeInTheDocument();
    expect(screen.getByText("✗ 210 Nay")).toBeInTheDocument();
  });

  it("displays category badges", () => {
    render(<KeyVotes votes={mockVotes} />);
    // Categories appear in both dropdown and badges, so use getAllByText
    expect(screen.getAllByText("Healthcare").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Climate & Environment").length).toBeGreaterThan(0);
  });

  it("shows result badges", () => {
    render(<KeyVotes votes={mockVotes} />);
    expect(screen.getAllByText("Passed").length).toBeGreaterThan(0);
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("respects limit prop", () => {
    render(<KeyVotes votes={mockVotes} limit={1} />);
    expect(screen.getByText(/H\.R\. 1/)).toBeInTheDocument();
    // Should show "Show More" button
    expect(screen.getByText(/Show.*More/i)).toBeInTheDocument();
  });

  it("expands on show more click", () => {
    render(<KeyVotes votes={mockVotes} limit={1} />);
    const showMore = screen.getByText(/Show.*More/i);
    fireEvent.click(showMore);
    // All votes should now be visible
    expect(screen.getByText(/H\.R\. 2/)).toBeInTheDocument();
  });

  it("filters by chamber", () => {
    render(<KeyVotes votes={mockVotes} showFilters={true} />);
    const chamberSelect = screen.getByLabelText("Chamber:");
    fireEvent.change(chamberSelect, { target: { value: "Senate" } });
    // Only Senate votes should show
    expect(screen.getByText(/S\. 1/)).toBeInTheDocument();
    expect(screen.queryByText(/^H\.R\. 1/)).not.toBeInTheDocument();
  });

  it("filters by category", () => {
    render(<KeyVotes votes={mockVotes} showFilters={true} />);
    const categorySelect = screen.getByLabelText("Category:");
    fireEvent.change(categorySelect, { target: { value: "Healthcare" } });
    expect(screen.getByText(/H\.R\. 1/)).toBeInTheDocument();
    expect(screen.queryByText(/^S\. 1/)).not.toBeInTheDocument();
  });

  it("shows empty state when no votes match filters", () => {
    render(<KeyVotes votes={[]} />);
    expect(screen.getByText(/No votes found/i)).toBeInTheDocument();
  });

  it("hides filters when showFilters is false", () => {
    render(<KeyVotes votes={mockVotes} showFilters={false} />);
    expect(screen.queryByText("Chamber:")).not.toBeInTheDocument();
  });
});
