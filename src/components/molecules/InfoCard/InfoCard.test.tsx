import { render, screen } from "@testing-library/react";
import React from "react";
import InfoCard from "./InfoCard";

describe("InfoCard", () => {
  it("renders children content", () => {
    render(
      <InfoCard>
        <h2>Title</h2>
        <p>Body</p>
      </InfoCard>
    );
    expect(screen.getByText(/title/i)).toBeInTheDocument();
    expect(screen.getByText(/body/i)).toBeInTheDocument();
  });

  it("renders markdown when provided", () => {
    render(<InfoCard markdown={"**Bold** line"} />);
    expect(screen.getByText(/bold/i)).toBeInTheDocument();
  });

  it("renders simple children content", () => {
    render(
      <InfoCard>
        <p>hello</p>
      </InfoCard>
    );
    expect(screen.getByText(/hello/i)).toBeInTheDocument();
  });

  it("renders all four decorative corners", () => {
    render(<InfoCard>content</InfoCard>);
    expect(screen.getByTestId("corner-tl")).toBeInTheDocument();
    expect(screen.getByTestId("corner-tr")).toBeInTheDocument();
    expect(screen.getByTestId("corner-br")).toBeInTheDocument();
    expect(screen.getByTestId("corner-bl")).toBeInTheDocument();
  });

  it("supports polymorphic as prop", () => {
    const { rerender, container } = render(
      <InfoCard as="section">content</InfoCard>
    );
    expect(container.querySelector("section")).toBeInTheDocument();
    rerender(<InfoCard as="article">content</InfoCard>);
    expect(container.querySelector("article")).toBeInTheDocument();
  });
});
