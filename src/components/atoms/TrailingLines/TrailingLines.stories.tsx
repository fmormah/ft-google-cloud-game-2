import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import TrailingLines from "./TrailingLines";

const meta: Meta<typeof TrailingLines> = {
  title: "Atoms/TrailingLines",
  component: TrailingLines,
  tags: ["autodocs"],
  args: {
    color: "#ffffff",
    lineHeightPx: 5,
    lineWidthPx: 1,
    gapPx: 20,
    durationSec: 4,
    direction: "ltr",
  },
  argTypes: {
    color: { control: "color" },
    lineHeightPx: { control: { type: "number", min: 1, max: 20 } },
    lineWidthPx: { control: { type: "number", min: 1, max: 10 } },
    gapPx: { control: { type: "number", min: 5, max: 100, step: 1 } },
    durationSec: { control: { type: "number", min: 1, max: 20, step: 0.5 } },
    direction: { control: { type: "inline-radio" }, options: ["ltr", "rtl"] },
  },
};

export default meta;

type Story = StoryObj<typeof TrailingLines>;

export const Default: Story = {
  render: (args) => (
    <div style={{ padding: 16 }}>
      <TrailingLines {...args} />
    </div>
  ),
};
