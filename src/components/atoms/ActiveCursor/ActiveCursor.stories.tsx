import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ActiveCursor, { type ActiveCursorProps } from "./ActiveCursor";

const meta: Meta<typeof ActiveCursor> = {
  title: "Atoms/ActiveCursor",
  component: ActiveCursor,
  tags: ["autodocs"],
  args: {
    color: "#ffffff",
    style: { display: "inline-block" },
    stationaryMode: false,
    hoverMode: false,
    label: "SELECT",
    invertColors: true,
  },
  argTypes: {
    size: { control: { type: "number", min: 8, max: 128, step: 1 } },
    dotSize: { control: { type: "number", min: 2, max: 32, step: 1 } },
    color: { control: "color" },
    stationaryMode: { control: "boolean" },
    hoverMode: { control: "boolean" },
    label: { control: "text" },
    invertColors: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof ActiveCursor>;

export const Default: Story = {};
