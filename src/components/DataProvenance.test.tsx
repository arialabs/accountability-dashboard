import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DataProvenance, { getDataset, daysSince } from "./DataProvenance";
import provenanceData from "@/data/data-provenance.json";

describe("DataProvenance", () => {
  it("registry covers every dataset rendered with the component", () => {
    // Datasets referenced from pages — keep in sync with usages
    const used = [
      "finance.json",
      "key-votes.json",
      "trades-by-member.json",
      "house-disclosures.json",
      "scandals.json",
      "bill-summaries.json",
      "scotus.json",
      "trading-summaries.json",
      "executive-orders.json",
      "cabinet.json",
      "deep-dives.json",
    ];
    for (const file of used) {
      expect(getDataset(file), `missing registry entry for ${file}`).toBeTruthy();
    }
  });

  it("renders source attribution and updated date", () => {
    render(<DataProvenance dataset="finance.json" />);
    expect(screen.getByText(/Source:/)).toBeTruthy();
    expect(screen.getByText(/FEC via OpenFEC/)).toBeTruthy();
    expect(screen.getByText(/updated/)).toBeTruthy();
  });

  it("labels editorial datasets with a review date instead of a source line", () => {
    render(<DataProvenance dataset="scandals.json" />);
    expect(screen.getAllByText(/Editorial/).length).toBeGreaterThan(0);
    expect(screen.getByText(/last reviewed/)).toBeTruthy();
  });

  it("shows a staleness warning exactly when an auto dataset is past its window", () => {
    const d = getDataset("live-votes.json")!;
    const age = daysSince(d.last_updated);
    render(<DataProvenance dataset="live-votes.json" />);
    const warning = screen.queryByText(/may be outdated/);
    if (d.stale_after_days !== null && age !== null && age > d.stale_after_days) {
      expect(warning).toBeTruthy();
    } else {
      expect(warning).toBeNull();
    }
  });

  it("renders nothing for unknown datasets", () => {
    const { container } = render(<DataProvenance dataset="nope.json" />);
    expect(container.innerHTML).toBe("");
  });

  it("every registry entry has a label, source, and refresh mode", () => {
    for (const d of (provenanceData as { datasets: Array<Record<string, unknown>> }).datasets) {
      expect(d.label).toBeTruthy();
      expect(d.source).toBeTruthy();
      expect(["auto-daily", "auto-weekly", "manual", "editorial"]).toContain(d.refresh);
    }
  });
});
