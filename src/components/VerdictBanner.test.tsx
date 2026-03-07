import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VerdictBanner } from "./VerdictBanner";
import type { RevolvingDoorEntry } from "@/lib/revolving-door";

const industryInsider: RevolvingDoorEntry = {
  type: "industry_insider",
  prior_industry: "Liberty Energy (Fossil Fuel / Fracking CEO)",
  summary: "CEO of Liberty Energy, a fracking services company. Now heads the Department of Energy.",
  severity: "critical",
};

const ideologicalConflict: RevolvingDoorEntry = {
  type: "ideological_conflict",
  prior_industry: "Children's Health Defense (Anti-Vaccine Advocacy)",
  summary: "Founded and led an anti-vaccine advocacy organization. Now heads HHS.",
  severity: "critical",
};

const lobbyingDoor: RevolvingDoorEntry = {
  type: "lobbying_door",
  prior_industry: "Fox News / Media",
  summary: "Fox News host with no transportation industry experience.",
  severity: "high",
};

const publicService: RevolvingDoorEntry = {
  type: "public_service",
  prior_industry: "U.S. Senate / Florida Legislature",
  summary: "Career politician from U.S. Senate — no direct industry conflict.",
  severity: "low",
};

describe("VerdictBanner", () => {
  it("renders the verdict headline", () => {
    render(<VerdictBanner entry={industryInsider} />);
    expect(screen.getByText("Who Does This Official Serve?")).toBeInTheDocument();
  });

  it("shows prior industry", () => {
    render(<VerdictBanner entry={industryInsider} />);
    expect(screen.getByText(industryInsider.prior_industry)).toBeInTheDocument();
  });

  it("shows summary text", () => {
    render(<VerdictBanner entry={industryInsider} />);
    expect(screen.getByText(industryInsider.summary)).toBeInTheDocument();
  });

  it("applies red background for industry_insider", () => {
    const { container } = render(<VerdictBanner entry={industryInsider} />);
    const banner = container.firstChild as HTMLElement;
    expect(banner.className).toMatch(/bg-red/);
  });

  it("applies red background for ideological_conflict", () => {
    const { container } = render(<VerdictBanner entry={ideologicalConflict} />);
    const banner = container.firstChild as HTMLElement;
    expect(banner.className).toMatch(/bg-red/);
  });

  it("applies amber background for lobbying_door", () => {
    const { container } = render(<VerdictBanner entry={lobbyingDoor} />);
    const banner = container.firstChild as HTMLElement;
    expect(banner.className).toMatch(/bg-amber/);
  });

  it("applies green background for public_service", () => {
    const { container } = render(<VerdictBanner entry={publicService} />);
    const banner = container.firstChild as HTMLElement;
    expect(banner.className).toMatch(/bg-green/);
  });

  it("shows verdict label for each type", () => {
    const { rerender } = render(<VerdictBanner entry={industryInsider} />);
    expect(screen.getByText("Industry Insider")).toBeInTheDocument();

    rerender(<VerdictBanner entry={ideologicalConflict} />);
    expect(screen.getByText("Mission Conflict")).toBeInTheDocument();

    rerender(<VerdictBanner entry={lobbyingDoor} />);
    expect(screen.getByText("Lobbyist / Media")).toBeInTheDocument();

    rerender(<VerdictBanner entry={publicService} />);
    expect(screen.getByText("Public Service")).toBeInTheDocument();
  });

  it("expands to show detail section on click", () => {
    render(<VerdictBanner entry={industryInsider} expandTargetId="revolving-door" />);
    const button = screen.getByRole("button", { name: /see full analysis/i });
    expect(button).toBeInTheDocument();
  });

  it("does not render expand button when no expandTargetId", () => {
    render(<VerdictBanner entry={industryInsider} />);
    expect(screen.queryByRole("button", { name: /see full analysis/i })).not.toBeInTheDocument();
  });

  it("renders nothing when entry is null", () => {
    const { container } = render(<VerdictBanner entry={null} />);
    expect(container.firstChild).toBeNull();
  });
});
