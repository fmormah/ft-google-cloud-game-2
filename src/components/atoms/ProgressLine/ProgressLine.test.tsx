import { render, screen } from "@testing-library/react";
import React from "react";
import ProgressLine, { type ProgressLineHandle } from "./ProgressLine";

describe("ProgressLine", () => {
  it("renders with the correct number of steps", () => {
    render(<ProgressLine steps={4} />);
    const steps = screen.getAllByTestId("step");
    expect(steps.length).toBe(4);
  });

  it("advances and reverses steps via handle", () => {
    const ref = React.createRef<ProgressLineHandle>();
    render(<ProgressLine ref={ref} steps={5} initialStep={0} />);

    expect(ref.current?.getStep()).toBe(0);
    ref.current?.nextStep();
    expect(ref.current?.getStep()).toBe(1);
    ref.current?.previousStep();
    expect(ref.current?.getStep()).toBe(0);
  });

  it("marks only the current step with the current class", () => {
    render(<ProgressLine steps={3} initialStep={1} />);
    const steps = screen.getAllByTestId("step");
    expect(steps[1].className).toMatch(/is-current/);
    expect(steps[0].className).not.toMatch(/is-current/);
    expect(steps[2].className).not.toMatch(/is-current/);
  });
});
