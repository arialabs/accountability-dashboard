import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import SocialShare from "./SocialShare";

describe("SocialShare", () => {
  const mockProps = {
    title: "Test Title",
    text: "Test text for sharing",
    url: "https://example.com/test",
  };

  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    });
  });

  it("renders the component with all share buttons", () => {
    render(<SocialShare {...mockProps} />);

    expect(screen.getByText("Share This Page")).toBeInTheDocument();
    expect(screen.getByText("Share on X")).toBeInTheDocument();
    expect(screen.getByText("Share on Facebook")).toBeInTheDocument();
    expect(screen.getByText("Share on LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Share on Reddit")).toBeInTheDocument();
    expect(screen.getByText("Copy Link")).toBeInTheDocument();
  });

  it("generates correct Twitter share URL", () => {
    render(<SocialShare {...mockProps} />);

    const twitterLink = screen.getByText("Share on X").closest("a");
    expect(twitterLink).toHaveAttribute(
      "href",
      expect.stringContaining("twitter.com/intent/tweet")
    );
    expect(twitterLink).toHaveAttribute(
      "href",
      expect.stringContaining(encodeURIComponent(mockProps.text))
    );
    expect(twitterLink).toHaveAttribute(
      "href",
      expect.stringContaining(encodeURIComponent(mockProps.url))
    );
  });

  it("generates correct Facebook share URL", () => {
    render(<SocialShare {...mockProps} />);

    const facebookLink = screen.getByText("Share on Facebook").closest("a");
    expect(facebookLink).toHaveAttribute(
      "href",
      expect.stringContaining("facebook.com/sharer")
    );
    expect(facebookLink).toHaveAttribute(
      "href",
      expect.stringContaining(encodeURIComponent(mockProps.url))
    );
  });

  it("generates correct LinkedIn share URL", () => {
    render(<SocialShare {...mockProps} />);

    const linkedinLink = screen.getByText("Share on LinkedIn").closest("a");
    expect(linkedinLink).toHaveAttribute(
      "href",
      expect.stringContaining("linkedin.com/sharing")
    );
    expect(linkedinLink).toHaveAttribute(
      "href",
      expect.stringContaining(encodeURIComponent(mockProps.url))
    );
  });

  it("generates correct Reddit share URL", () => {
    render(<SocialShare {...mockProps} />);

    const redditLink = screen.getByText("Share on Reddit").closest("a");
    expect(redditLink).toHaveAttribute(
      "href",
      expect.stringContaining("reddit.com/submit")
    );
    expect(redditLink).toHaveAttribute(
      "href",
      expect.stringContaining(encodeURIComponent(mockProps.url))
    );
    expect(redditLink).toHaveAttribute(
      "href",
      expect.stringContaining(encodeURIComponent(mockProps.title))
    );
  });

  it("copies URL to clipboard when copy button is clicked", async () => {
    render(<SocialShare {...mockProps} />);

    const copyButton = screen.getByText("Copy Link");
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockProps.url);
    });

    // Check if "Copied!" message appears
    await waitFor(() => {
      expect(screen.getByText("Copied!")).toBeInTheDocument();
    });
  });

  it("shows copy button text again after 2 seconds", async () => {
    vi.useFakeTimers();
    render(<SocialShare {...mockProps} />);

    const copyButton = screen.getByText("Copy Link");
    
    // Click and wait for clipboard promise to resolve (wrapped in act for state updates)
    await act(async () => {
      fireEvent.click(copyButton);
      // Allow microtasks (Promise.resolve) to complete
      await Promise.resolve();
      await Promise.resolve(); // flush any pending microtasks
    });

    // "Copied!" should be shown now
    expect(screen.getByText("Copied!")).toBeInTheDocument();

    // Fast-forward time by 2 seconds to reset the copied state
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText("Copy Link")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("opens share links in new tab", () => {
    render(<SocialShare {...mockProps} />);

    const shareLinks = screen.getAllByRole("link");
    shareLinks.forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("handles clipboard write errors gracefully", async () => {
    // The component silently swallows clipboard errors to avoid disrupting UX
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.reject(new Error("Clipboard error"))),
      },
    });

    render(<SocialShare {...mockProps} />);

    const copyButton = screen.getByText("Copy Link");
    // Should not throw even when clipboard fails
    await expect(async () => {
      fireEvent.click(copyButton);
      await new Promise(resolve => setTimeout(resolve, 50));
    }).not.toThrow();

    // Button should still show "Copy Link" (not "Copied!") since clipboard failed
    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
  });
});
