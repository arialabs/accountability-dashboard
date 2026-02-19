import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import JusticePage from "./page";

describe("Individual Justice Page", () => {
  it("renders justice name", async () => {
    const page = await JusticePage({ params: Promise.resolve({ id: "roberts" }) });
    render(page);
    
    expect(screen.getByText(/John G. Roberts Jr./)).toBeDefined();
  });

  it("shows appointing president", async () => {
    const page = await JusticePage({ params: Promise.resolve({ id: "sotomayor" }) });
    render(page);
    
    // Check for "Appointed by" text and the president's name
    expect(screen.getByText("Appointed by")).toBeDefined();
    expect(screen.getAllByText("Barack Obama").length).toBeGreaterThan(0);
  });

  it("displays ideology score", async () => {
    const page = await JusticePage({ params: Promise.resolve({ id: "thomas" }) });
    render(page);
    
    expect(screen.getByText(/Ideology Score/)).toBeDefined();
    expect(screen.getByText("3.28")).toBeDefined();
  });

  it("shows confirmation year", async () => {
    const page = await JusticePage({ params: Promise.resolve({ id: "jackson" }) });
    render(page);
    
    expect(screen.getByText(/Confirmed in 2022/)).toBeDefined();
  });

  it("displays justice biography", async () => {
    const page = await JusticePage({ params: Promise.resolve({ id: "kagan" }) });
    render(page);
    
    expect(screen.getByText(/Harvard Law School/)).toBeDefined();
  });

  it("shows ideology visualization", async () => {
    const page = await JusticePage({ params: Promise.resolve({ id: "gorsuch" }) });
    render(page);
    
    expect(screen.getByText("Ideology Score")).toBeDefined();
    // Conservative appears multiple times, so use getAllByText
    const conservativeElements = screen.getAllByText(/Conservative/);
    expect(conservativeElements.length).toBeGreaterThan(0);
  });

  it("handles Chief Justice title correctly", async () => {
    const page = await JusticePage({ params: Promise.resolve({ id: "roberts" }) });
    render(page);
    
    expect(screen.getByText("Chief Justice")).toBeDefined();
  });

  it("handles Associate Justice title correctly", async () => {
    const page = await JusticePage({ params: Promise.resolve({ id: "barrett" }) });
    render(page);
    
    expect(screen.getByText("Associate Justice")).toBeDefined();
  });
});
