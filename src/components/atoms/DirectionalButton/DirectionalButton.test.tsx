import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import DirectionalButton from "./DirectionalButton";

describe("DirectionalButton", () => {
  it("renders label and calls onClick (button)", () => {
    const onClick = vi.fn();
    render(<DirectionalButton label="Continue" onClick={onClick} />);
    const btn = screen.getByRole("button", { name: /continue/i });
    expect(btn).toHaveAttribute("data-analytics-text", "Continue");
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders as link and calls onClick", () => {
    const onClick = vi.fn();
    render(
      <DirectionalButton
        as="a"
        href="https://example.com"
        label="Continue"
        onClick={onClick}
      />
    );
    const link = screen.getByRole("link", { name: /continue/i });
    expect(link).toHaveAttribute("data-analytics-text", "Continue");
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("supports left and right directions", () => {
    const { rerender } = render(
      <DirectionalButton label="Rewind" direction="left" />
    );
    expect(screen.getByRole("button", { name: /rewind/i })).toBeInTheDocument();
    rerender(<DirectionalButton label="Continue" direction="right" />);
    expect(
      screen.getByRole("button", { name: /continue/i })
    ).toBeInTheDocument();
  });
});
