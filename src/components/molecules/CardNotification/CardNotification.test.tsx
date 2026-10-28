import { render, screen } from "@testing-library/react";
import React from "react";
import CardNotification from "./CardNotification";

describe("CardNotification", () => {
  it("renders label and optional icon", () => {
    render(<CardNotification label="Engine Running" iconName="crisis_alert" />);
    expect(screen.getByText(/engine running/i)).toBeInTheDocument();
  });
});
