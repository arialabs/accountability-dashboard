import { describe, it, expect } from "vitest";
import {
  getRevolvingDoorStatus,
  getRevolvingDoorLabel,
  getRevolvingDoorColor,
  REVOLVING_DOOR_DATA,
} from "./revolving-door";

describe("getRevolvingDoorStatus", () => {
  it("identifies industry insiders - fossil fuel CEO to Energy Secretary", () => {
    const status = getRevolvingDoorStatus("secretary-of-energy");
    expect(status).toBe("industry_insider");
  });

  it("identifies industry insiders - Wall Street CEO to Commerce Secretary", () => {
    const status = getRevolvingDoorStatus("secretary-of-commerce");
    expect(status).toBe("industry_insider");
  });

  it("identifies industry insiders - hedge fund manager to Treasury Secretary", () => {
    const status = getRevolvingDoorStatus("secretary-of-treasury");
    expect(status).toBe("industry_insider");
  });

  it("identifies ideological conflicts - anti-vaxxer to HHS Secretary", () => {
    const status = getRevolvingDoorStatus("secretary-of-hhs");
    expect(status).toBe("ideological_conflict");
  });

  it("identifies ideological conflicts - climate denier to EPA Administrator", () => {
    const status = getRevolvingDoorStatus("epa-administrator");
    expect(status).toBe("ideological_conflict");
  });

  it("identifies lobbying background - former AG turned lobbyist", () => {
    const status = getRevolvingDoorStatus("attorney-general");
    expect(status).toBe("lobbying_door");
  });

  it("identifies public service background for primary government officials", () => {
    const status = getRevolvingDoorStatus("secretary-of-state");
    expect(status).toBe("public_service");
  });

  it("returns null for unknown members", () => {
    const status = getRevolvingDoorStatus("unknown-member");
    expect(status).toBeNull();
  });
});

describe("getRevolvingDoorLabel", () => {
  it("returns human-readable label for industry_insider", () => {
    const label = getRevolvingDoorLabel("industry_insider");
    expect(label).toContain("Industry");
  });

  it("returns human-readable label for ideological_conflict", () => {
    const label = getRevolvingDoorLabel("ideological_conflict");
    expect(label).toContain("Mission Conflict");
  });

  it("returns human-readable label for lobbying_door", () => {
    const label = getRevolvingDoorLabel("lobbying_door");
    expect(label).toContain("Lobbyist");
  });

  it("returns human-readable label for public_service", () => {
    const label = getRevolvingDoorLabel("public_service");
    expect(label).toContain("Public Service");
  });

  it("returns null for null input", () => {
    const label = getRevolvingDoorLabel(null);
    expect(label).toBeNull();
  });
});

describe("getRevolvingDoorColor", () => {
  it("returns red/danger color for industry_insider", () => {
    const color = getRevolvingDoorColor("industry_insider");
    expect(color).toMatch(/red/i);
  });

  it("returns orange/warning color for ideological_conflict", () => {
    const color = getRevolvingDoorColor("ideological_conflict");
    expect(color).toMatch(/orange|amber/i);
  });

  it("returns yellow color for lobbying_door", () => {
    const color = getRevolvingDoorColor("lobbying_door");
    expect(color).toMatch(/yellow|amber/i);
  });

  it("returns green for public_service", () => {
    const color = getRevolvingDoorColor("public_service");
    expect(color).toMatch(/green/i);
  });

  it("returns gray for null", () => {
    const color = getRevolvingDoorColor(null);
    expect(color).toMatch(/slate|gray/i);
  });
});

describe("REVOLVING_DOOR_DATA", () => {
  it("contains data for all major cabinet members", () => {
    expect(REVOLVING_DOOR_DATA["secretary-of-energy"]).toBeDefined();
    expect(REVOLVING_DOOR_DATA["secretary-of-commerce"]).toBeDefined();
    expect(REVOLVING_DOOR_DATA["secretary-of-treasury"]).toBeDefined();
    expect(REVOLVING_DOOR_DATA["secretary-of-hhs"]).toBeDefined();
    expect(REVOLVING_DOOR_DATA["epa-administrator"]).toBeDefined();
  });

  it("each entry has type, prior_industry, and summary", () => {
    const entry = REVOLVING_DOOR_DATA["secretary-of-energy"];
    expect(entry.type).toBeDefined();
    expect(entry.prior_industry).toBeDefined();
    expect(entry.summary).toBeDefined();
  });
});
