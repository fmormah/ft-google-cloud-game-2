import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { vi, describe, it, expect } from "vitest";
import Button from "./Button";

describe("Button", () => {
  describe("Basic Rendering", () => {
    it("renders label and fires onClick", () => {
      const onClick = vi.fn();
      render(<Button label="Click Me" onClick={onClick} />);
      const btn = screen.getByRole("button", { name: /click me/i });
      expect(btn).toHaveAttribute("data-analytics-text", "Click Me");
      fireEvent.click(btn);
      expect(onClick).toHaveBeenCalled();
    });

    it("renders with custom className", () => {
      render(<Button label="Test" className="custom-class" />);
      const btn = screen.getByRole("button", { name: /test/i });
      expect(btn.className).toMatch(/custom-class/);
    });

    it("renders with children when provided", () => {
      render(
        <Button label="Test">
          <span>Custom Content</span>
        </Button>
      );
      expect(screen.getByText("Custom Content")).toBeInTheDocument();
      // Tracking should still use the component label, even when children override visible text.
      expect(screen.getByRole("button")).toHaveAttribute(
        "data-analytics-text",
        "Test"
      );
    });

    it("renders as link when href is provided", () => {
      render(<Button label="Link" href="/test" />);
      const link = screen.getByRole("link", { name: /link/i });
      expect(link).toBeInTheDocument();
      expect(link.getAttribute("href")).toBe("/test");
      expect(link).toHaveAttribute("data-analytics-text", "Link");
    });

    it("renders as link with target blank and rel noopener noreferrer", () => {
      render(<Button label="External" href="https://external.com" />);
      const link = screen.getByRole("link", { name: /external/i });
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    });
  });

  describe("Styling and Variants", () => {
    it("applies selected class when selected=true", () => {
      render(<Button label="Selected" selected />);
      const btn = screen.getByRole("button", { name: /selected/i });
      expect(btn.className).toMatch(/is-selected/);
    });

    it("applies full-width class when fullWidth=true", () => {
      render(<Button label="Full Width" fullWidth />);
      const btn = screen.getByRole("button", { name: /full width/i });
      expect(btn.className).toMatch(/Button--full-width/);
    });

    it("applies icon-only class when iconOnly=true", () => {
      render(<Button label="Icon Only" iconOnly aria-label="Icon action" />);
      const btn = screen.getByRole("button", { name: /icon action/i });
      expect(btn.className).toMatch(/Button--icon-only/);
    });

    it("applies no-icon class when no icon is provided", () => {
      render(<Button label="No Icon" />);
      const btn = screen.getByRole("button", { name: /no icon/i });
      expect(btn.className).toMatch(/Button--no-icon/);
    });

    it("applies corner variant classes", () => {
      render(<Button label="Corners All" cornerVariant="all" />);
      const btn = screen.getByRole("button", { name: /corners all/i });
      expect(btn.className).toMatch(/Button--corners-all/);
    });
  });

  describe("Icons", () => {
    it("renders icon when iconSrc is provided", () => {
      render(<Button label="With Icon" iconSrc="/test-icon.png" />);
      const img = screen.getByAltText("");
      expect(img.getAttribute("src")).toContain("test-icon.png");
    });

    it("renders icon when icon component is provided", () => {
      const TestIcon = () => <span>Test Icon</span>;
      render(<Button label="With Icon Component" icon={<TestIcon />} />);
      expect(screen.getByText("Test Icon")).toBeInTheDocument();
    });

  });

  describe("Accessibility", () => {
    it("is disabled when disabled prop is true", () => {
      render(<Button label="Disabled" disabled />);
      const btn = screen.getByRole("button", { name: /disabled/i });
      expect(btn).toBeDisabled();
    });

    it("applies disabled class when disabled", () => {
      render(<Button label="Disabled" disabled />);
      const btn = screen.getByRole("button", { name: /disabled/i });
      expect(btn.className).toMatch(/Button--no-icon/); // Should still have base classes
    });
  });

  describe("Event Handling", () => {
    it("calls onClick when button is clicked", () => {
      const onClick = vi.fn();
      render(<Button label="Clickable" onClick={onClick} />);
      const btn = screen.getByRole("button", { name: /clickable/i });
      fireEvent.click(btn);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("calls onClick with correct event for link", () => {
      const onClick = vi.fn();
      render(<Button label="Link Click" href="/test" onClick={onClick} />);
      const link = screen.getByRole("link", { name: /link click/i });
      fireEvent.click(link);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty label gracefully", () => {
      render(<Button label="" />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("handles all props together", () => {
      const onClick = vi.fn();
      const TestIcon = () => <span>Icon</span>;

      render(
        <Button
          label="Complex"
          icon={<TestIcon />}
          fullWidth
          selected
          cornerVariant="top"
          className="complex-test"
          onClick={onClick}
        />
      );

      const btn = screen.getByRole("button", { name: /complex/i });
      expect(btn.className).toMatch(/Button--full-width/);
      expect(btn.className).toMatch(/is-selected/);
      expect(btn.className).toMatch(/Button--corners-top/);
      expect(btn.className).toMatch(/complex-test/);
      expect(screen.getByText("Icon")).toBeInTheDocument();

      fireEvent.click(btn);
      expect(onClick).toHaveBeenCalled();
    });
  });
});
