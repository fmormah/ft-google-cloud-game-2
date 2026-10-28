import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React, { useRef } from "react";
import ProgressLine, {
  type ProgressLineHandle,
  type ProgressLineProps,
} from "./ProgressLine";

const meta: Meta<typeof ProgressLine> = {
  title: "Atoms/ProgressLine",
  component: ProgressLine,
  tags: ["autodocs"],
  args: {
    steps: 5 satisfies ProgressLineProps["steps"],
    initialStep: 0,
  },
  argTypes: {
    steps: { control: { type: "number", min: 2, max: 12, step: 1 } },
    initialStep: { control: { type: "number", min: 0 } },
    lineColor: { control: "color" },
  },
};

export default meta;

type Story = StoryObj<typeof ProgressLine>;

export const Default: Story = {
  render: (args) => (
    <div style={{ padding: 16 }}>
      <ProgressLine {...args} />
    </div>
  ),
};

const WithControlsTemplate: React.FC<ProgressLineProps> = (args) => {
  const ref = useRef<ProgressLineHandle>(null);
  return (
    <div style={{ padding: 16 }}>
      <ProgressLine ref={ref} {...args} />
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={() => ref.current?.previousStep()}>Prev</button>
        <button onClick={() => ref.current?.nextStep()}>Next</button>
      </div>
    </div>
  );
};

export const WithControls: Story = {
  render: (args) => <WithControlsTemplate {...(args as ProgressLineProps)} />,
};
