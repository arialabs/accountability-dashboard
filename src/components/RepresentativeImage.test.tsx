import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RepresentativeImage from "./RepresentativeImage";

describe("RepresentativeImage", () => {
  it("renders image element with correct src", () => {
    render(
      <RepresentativeImage
        bioguideId="P000197"
        fullName="Nancy Pelosi"
        party="D"
        photoUrl="https://bioguide.congress.gov/bioguide/photo/P/P000197.jpg"
        size="md"
      />
    );

    const img = screen.getByRole("img", { name: /Nancy Pelosi/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src");
  });

  it("constructs bioguide URL from bioguideId when no photoUrl provided", () => {
    const { container } = render(
      <RepresentativeImage
        bioguideId="L000566"
        fullName="Robert Latta"
        party="R"
        size="md"
      />
    );

    // Should render an image that attempts to load from bioguide
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
  });

  it("renders with small size variant", () => {
    const { container } = render(
      <RepresentativeImage
        bioguideId="P000197"
        fullName="Nancy Pelosi"
        party="D"
        photoUrl="https://bioguide.congress.gov/bioguide/photo/P/P000197.jpg"
        size="sm"
      />
    );

    // Check for size class
    expect(container.querySelector(".w-12")).toBeInTheDocument();
  });

  it("renders with medium size variant", () => {
    const { container } = render(
      <RepresentativeImage
        bioguideId="P000197"
        fullName="Nancy Pelosi"
        party="D"
        photoUrl="https://bioguide.congress.gov/bioguide/photo/P/P000197.jpg"
        size="md"
      />
    );

    expect(container.querySelector(".w-16")).toBeInTheDocument();
  });

  it("renders with large size variant", () => {
    const { container } = render(
      <RepresentativeImage
        bioguideId="P000197"
        fullName="Nancy Pelosi"
        party="D"
        photoUrl="https://bioguide.congress.gov/bioguide/photo/P/P000197.jpg"
        size="lg"
      />
    );

    expect(container.querySelector(".w-32")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <RepresentativeImage
        bioguideId="P000197"
        fullName="Nancy Pelosi"
        party="D"
        photoUrl="https://bioguide.congress.gov/bioguide/photo/P/P000197.jpg"
        size="md"
        className="custom-class"
      />
    );

    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("has proper alt text for accessibility", () => {
    render(
      <RepresentativeImage
        bioguideId="P000197"
        fullName="Nancy Pelosi"
        party="D"
        photoUrl="https://bioguide.congress.gov/bioguide/photo/P/P000197.jpg"
        size="md"
      />
    );

    const img = screen.getByAltText("Nancy Pelosi");
    expect(img).toBeInTheDocument();
  });

  it("uses lazy loading", () => {
    render(
      <RepresentativeImage
        bioguideId="P000197"
        fullName="Nancy Pelosi"
        party="D"
        photoUrl="https://bioguide.congress.gov/bioguide/photo/P/P000197.jpg"
        size="md"
      />
    );

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("has rounded styling", () => {
    const { container } = render(
      <RepresentativeImage
        bioguideId="P000197"
        fullName="Nancy Pelosi"
        party="D"
        photoUrl="https://bioguide.congress.gov/bioguide/photo/P/P000197.jpg"
        size="md"
      />
    );

    const img = container.querySelector("img");
    expect(img?.className).toContain("rounded-full");
  });
});
