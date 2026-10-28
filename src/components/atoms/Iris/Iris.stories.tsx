import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Iris, { type IrisProps } from "./Iris";

const meta: Meta<typeof Iris> = {
  title: "Atoms/Iris",
  component: Iris,
  tags: ["autodocs"],
  args: {
    dashLength: 10 satisfies IrisProps["dashLength"],
    dashHeight: 2,
    gapLength: 5,
    rotationSpeedSec: 10,
    direction: "clockwise",
    color: "#ffffff",
    style: { width: 200, height: 200 },
  },
  argTypes: {
    dashLength: { control: { type: "number", min: 1, max: 50, step: 1 } },
    dashHeight: { control: { type: "number", min: 0.5, max: 10, step: 0.5 } },
    gapLength: { control: { type: "number", min: 1, max: 50, step: 1 } },
    rotationSpeedSec: {
      control: { type: "number", min: 1, max: 60, step: 0.5 },
    },
    direction: {
      control: { type: "inline-radio" },
      options: ["clockwise", "counter-clockwise"],
    },
    color: { control: "color" },
  },
};

export default meta;

type Story = StoryObj<typeof Iris>;

export const Default: Story = {};
