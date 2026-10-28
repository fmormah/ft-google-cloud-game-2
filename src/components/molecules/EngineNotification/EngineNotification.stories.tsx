import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import EngineNotification from "./EngineNotification";

const meta: Meta<typeof EngineNotification> = {
  title: "Molecules/EngineNotification",
  component: EngineNotification,
  tags: ["autodocs"],
  args: {
    brandLabel: "SUNRISE CEREALS CO.",
    statusBase: "ENGINE RUNNING",
    dotIntervalMs: 650,
    maxDots: 3,
  },
  argTypes: {
    brandLabel: { control: "text" },
    statusBase: { control: "text" },
    dotIntervalMs: {
      control: { type: "number", min: 100, max: 2000, step: 50 },
    },
    maxDots: { control: { type: "number", min: 1, max: 6, step: 1 } },
  },
};

export default meta;

type Story = StoryObj<typeof EngineNotification>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "100%" }}>
      <EngineNotification {...args} />
    </div>
  ),
};
