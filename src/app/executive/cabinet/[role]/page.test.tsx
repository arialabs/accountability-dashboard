import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CabinetMemberPage from "./page";

describe("CabinetMemberPage", () => {
  const mockParams = { role: "secretary-of-state" };

  it("renders member name", async () => {
    const page = await CabinetMemberPage({ params: Promise.resolve(mockParams) });
    render(page);
    expect(screen.getByText("Marco Rubio")).toBeDefined();
  });

  it("renders member role", async () => {
    const page = await CabinetMemberPage({ params: Promise.resolve(mockParams) });
    render(page);
    expect(screen.getAllByText("Secretary of State").length).toBeGreaterThan(0);
  });

  it("renders department name", async () => {
    const page = await CabinetMemberPage({ params: Promise.resolve(mockParams) });
    render(page);
    expect(screen.getAllByText("Department of State").length).toBeGreaterThan(0);
  });

  it("renders appointed date", async () => {
    const page = await CabinetMemberPage({ params: Promise.resolve(mockParams) });
    render(page);
    expect(screen.getByText("January 20, 2025")).toBeDefined();
  });

  it("renders confirmation vote", async () => {
    const page = await CabinetMemberPage({ params: Promise.resolve(mockParams) });
    render(page);
    expect(screen.getByText(/99-0/)).toBeDefined();
  });

  it("displays member photo", async () => {
    const page = await CabinetMemberPage({ params: Promise.resolve(mockParams) });
    render(page);
    const image = screen.getByAltText("Marco Rubio");
    expect(image).toBeDefined();
  });

  it("has link back to cabinet page", async () => {
    const page = await CabinetMemberPage({ params: Promise.resolve(mockParams) });
    render(page);
    expect(screen.getByText(/Back to Cabinet/)).toBeDefined();
  });

  it("renders with different cabinet member", async () => {
    const defensePage = await CabinetMemberPage({ 
      params: Promise.resolve({ role: "secretary-of-defense" }) 
    });
    render(defensePage);
    expect(screen.getByText("Pete Hegseth")).toBeDefined();
    expect(screen.getAllByText("Secretary of Defense").length).toBeGreaterThan(0);
  });

  it("does not show Coming Soon placeholders", async () => {
    const page = await CabinetMemberPage({ params: Promise.resolve(mockParams) });
    render(page);
    const comingSoon = screen.queryAllByText(/Coming Soon/i);
    expect(comingSoon.length).toBe(0);
  });
});
