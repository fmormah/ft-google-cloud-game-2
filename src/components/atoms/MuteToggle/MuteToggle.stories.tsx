import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React, { useState } from "react";
import MuteToggle, { type MuteToggleProps } from "./MuteToggle";
import { CursorProvider } from "@/contexts/CursorContext";

const meta: Meta<typeof MuteToggle> = {
  title: "Atoms/MuteToggle",
  component: MuteToggle,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <CursorProvider>
        <Story />
      </CursorProvider>
    ),
  ],
  args: {
    bars: 8 satisfies MuteToggleProps["bars"],
    defaultOn: false,
  },
  argTypes: {
    bars: { control: { type: "number", min: 3, max: 24, step: 1 } },
    color: { control: "color" },
  },
};

export default meta;

type Story = StoryObj<typeof MuteToggle>;

export const Uncontrolled: Story = {
  render: (args) => (
    <div style={{ width: 120, height: 32, display: "inline-flex" }}>
      <MuteToggle {...args} />
    </div>
  ),
};

const ControlledTemplate: React.FC<MuteToggleProps> = (args) => {
  const [on, setOn] = useState(false);
  return (
    <div style={{ width: 120, height: 32, display: "inline-flex" }}>
      <MuteToggle
        {...args}
        isOn={on}
        onToggle={(next) => setOn(next)}
        onTurnOn={() => console.log("on")}
        onTurnOff={() => console.log("off")}
      />
    </div>
  );
};

export const Controlled: Story = {
  render: (args) => <ControlledTemplate {...(args as MuteToggleProps)} />,
};
