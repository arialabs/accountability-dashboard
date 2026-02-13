import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DogePage from "./page";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("DogePage", () => {
  it("renders the page title and leader name", () => {
    render(<DogePage />);
    expect(screen.getByText("Elon Musk")).toBeTruthy();
    expect(screen.getAllByText(/Department of Government Efficiency/).length).toBeGreaterThan(0);
  });

  it("renders key stats", () => {
    render(<DogePage />);
    expect(screen.getByText("352,000")).toBeTruthy();
    expect(screen.getByText("123,000")).toBeTruthy();
    expect(screen.getByText("$206B")).toBeTruthy();
    expect(screen.getByText("+$248B")).toBeTruthy();
    expect(screen.getByText("65+")).toBeTruthy();
  });

  it("renders affected agencies", () => {
    render(<DogePage />);
    expect(screen.getAllByText("USAID").length).toBeGreaterThan(0);
    expect(screen.getAllByText("CFPB").length).toBeGreaterThan(0);
    expect(screen.getAllByText("IRS").length).toBeGreaterThan(0);
    expect(screen.getAllByText("EPA").length).toBeGreaterThan(0);
  });

  it("renders conflicts of interest section", () => {
    render(<DogePage />);
    expect(screen.getByText("⚠️ Conflicts of Interest")).toBeTruthy();
    expect(screen.getByText("SpaceX")).toBeTruthy();
    expect(screen.getByText("Tesla")).toBeTruthy();
  });

  it("renders timeline actions", () => {
    render(<DogePage />);
    expect(screen.getByText("DOGE Established via Executive Order")).toBeTruthy();
    expect(screen.getByText("DOGE Quietly Disbanded")).toBeTruthy();
  });

  it("renders legal challenges section", () => {
    render(<DogePage />);
    expect(screen.getByText("⚖️ Legal Challenges")).toBeTruthy();
    expect(screen.getByText("Alliance for Retired Americans v. Bessent")).toBeTruthy();
  });

  it("renders promise vs reality callout", () => {
    render(<DogePage />);
    expect(screen.getByText(/Cut \$2 trillion/)).toBeTruthy();
    expect(screen.getByText(/Reality Check/)).toBeTruthy();
  });

  it("renders back link to executive branch", () => {
    render(<DogePage />);
    const link = screen.getByText("← Back to Executive Branch");
    expect(link.closest("a")?.getAttribute("href")).toBe("/executive");
  });

  it("renders the DISBANDED badge", () => {
    render(<DogePage />);
    expect(screen.getAllByText("DISBANDED").length).toBeGreaterThan(0);
  });

  it("renders data sources section", () => {
    render(<DogePage />);
    expect(screen.getByText("Associated Press")).toBeTruthy();
    expect(screen.getByText("The New York Times")).toBeTruthy();
  });
});
