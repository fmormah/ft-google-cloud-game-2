import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import LoadingBar, { type LoadingBarProps } from "./LoadingBar";

const meta: Meta<typeof LoadingBar> = {
  title: "Atoms/LoadingBar",
  component: LoadingBar,
  tags: ["autodocs"],
  args: {
    count: 12 satisfies LoadingBarProps["count"],
    color: "#ffffff",
    delayStepSec: 0.2,
    cycleDurationSec: 4.6,
    direction: "ltr",
  },
  argTypes: {
    count: { control: { type: "number", min: 3, max: 40, step: 1 } },
    color: { control: "color" },
    delayStepSec: {
      control: { type: "number", min: 0.05, max: 1, step: 0.05 },
    },
    cycleDurationSec: {
      control: { type: "number", min: 2, max: 10, step: 0.1 },
    },
    direction: { control: { type: "inline-radio" }, options: ["ltr", "rtl"] },
  },
};

export default meta;

type Story = StoryObj<typeof LoadingBar>;

export const Default: Story = {
  render: (args) => (
    <div style={{ padding: 16 }}>
      <LoadingBar {...args} />
    </div>
  ),
};
