import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React, { useRef, useEffect } from "react";
import NodeLine, { type NodeLineHandle, type NodeLineProps } from "./NodeLine";

const meta: Meta<typeof NodeLine> = {
  title: "Atoms/NodeLine",
  component: NodeLine,
  tags: ["autodocs"],
  args: {
    line1Angle: 0,
    line1Length: 60,
    line2Angle: 45,
    line2Length: 50,
    animationSpeedSec: 0.5,
    color: "#ffffff",
    label: "Label",
    labelAngle: 0,
  },
  argTypes: {
    line1Angle: { control: { type: "range", min: -180, max: 180 } },
    line1Length: { control: { type: "range", min: 10, max: 100 } },
    line2Angle: { control: { type: "range", min: -180, max: 180 } },
    line2Length: { control: { type: "range", min: 10, max: 100 } },
    animationSpeedSec: {
      control: { type: "range", min: 0.1, max: 1.5, step: 0.1 },
    },
    color: { control: "color" },
    label: { control: "text" },
    labelAngle: { control: { type: "range", min: -180, max: 180 } },
  },
};

export default meta;

type Story = StoryObj<typeof NodeLine>;

const Template: React.FC<NodeLineProps> = (args) => {
  const ref = useRef<NodeLineHandle>(null);
  useEffect(() => {
    ref.current?.trigger();
  }, [
    args.line1Angle,
    args.line1Length,
    args.line2Angle,
    args.line2Length,
    args.animationSpeedSec,
    args.color,
    args.label,
    args.labelAngle,
  ]);

  return (
    <div style={{ padding: "2rem" }}>
      <NodeLine ref={ref} {...args} />
      <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
        <button onClick={() => ref.current?.trigger()}>Replay Animation</button>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
};
