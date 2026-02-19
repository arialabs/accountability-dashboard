import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CabinetPage from "./page";

describe("CabinetPage", () => {
  it("renders cabinet grid", () => {
    render(<CabinetPage />);
    // "Cabinet Members" may appear in multiple elements (h1, meta, etc.)
    expect(screen.getAllByText("Cabinet Members").length).toBeGreaterThan(0);
  });

  it("shows member name and role", () => {
    render(<CabinetPage />);
    // Check for Secretary of State
    expect(screen.getByText("Marco Rubio")).toBeDefined();
    expect(screen.getByText("Secretary of State")).toBeDefined();
  });

  it("shows multiple cabinet members", () => {
    render(<CabinetPage />);
    // Check for several members
    expect(screen.getByText("Marco Rubio")).toBeDefined();
    expect(screen.getByText("Pete Hegseth")).toBeDefined();
    expect(screen.getByText("Pam Bondi")).toBeDefined();
  });

  it("links to individual pages", () => {
    render(<CabinetPage />);
    const links = screen.getAllByRole("link");
    // Should have links for each cabinet member
    expect(links.length).toBeGreaterThan(0);
  });

  it("displays on responsive grid", () => {
    render(<CabinetPage />);
    const grid = screen.getByTestId("cabinet-grid");
    // Grid should have responsive classes
    expect(grid.className).toMatch(/grid/);
    expect(grid.className).toMatch(/grid-cols/);
  });

  it("displays on desktop responsive grid (4 cols)", () => {
    render(<CabinetPage />);
    const grid = screen.getByTestId("cabinet-grid");
    // Component uses xl:grid-cols-4
    expect(grid.className).toContain("xl:grid-cols-4");
  });

  it("shows department information", () => {
    render(<CabinetPage />);
    // "Department of State" appears in multiple places (option + card)
    expect(screen.getAllByText("Department of State").length).toBeGreaterThan(0);
  });

  it("displays cabinet member photos", () => {
    render(<CabinetPage />);
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);
  });
});
