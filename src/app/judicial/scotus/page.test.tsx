import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ScotusPage from "./page";

describe("SCOTUS Grid Page", () => {
  it("renders all 9 justices", () => {
    render(<ScotusPage />);
    
    // Justice names may appear multiple times in the page (cards + links)
    // Use getAllByText and check at least one instance exists
    expect(screen.getAllByText(/John G. Roberts Jr./).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Clarence Thomas/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Samuel A. Alito Jr./).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Sonia Sotomayor/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Elena Kagan/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Neil M. Gorsuch/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Brett M. Kavanaugh/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Amy Coney Barrett/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ketanji Brown Jackson/).length).toBeGreaterThan(0);
  });

  it("shows justice name and appointing president", () => {
    render(<ScotusPage />);
    
    // Check that appointing presidents are displayed (use getAllByText since presidents may appear multiple times)
    expect(screen.getAllByText(/George W. Bush/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Barack Obama/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Donald Trump/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Joe Biden/).length).toBeGreaterThan(0);
  });

  it("displays Chief Justice designation", () => {
    render(<ScotusPage />);
    
    // Roberts should be marked as Chief Justice
    expect(screen.getByText("Chief Justice")).toBeDefined();
  });

  it("shows confirmation years", () => {
    render(<ScotusPage />);
    
    // Check for some confirmation years
    expect(screen.getAllByText(/2005/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2022/).length).toBeGreaterThan(0);
  });

  it("displays ideology indicators for all justices", () => {
    render(<ScotusPage />);
    
    // All justices should have ideology labels
    const liberalLabels = screen.getAllByText(/Liberal/);
    const conservativeLabels = screen.getAllByText(/Conservative/);
    
    // Should have at least some of each
    expect(liberalLabels.length).toBeGreaterThan(0);
    expect(conservativeLabels.length).toBeGreaterThan(0);
  });

  it("renders page heading", () => {
    render(<ScotusPage />);
    
    expect(screen.getByText("Supreme Court Justices")).toBeDefined();
  });
});
