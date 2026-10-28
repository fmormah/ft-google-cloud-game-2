import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import SwipeBarInstruction from "./SwipeBarInstruction";

const meta: Meta<typeof SwipeBarInstruction> = {
  title: "Molecules/SwipeBarInstruction",
  component: SwipeBarInstruction,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#333333" },
        { name: "light", value: "#f0f0f0" },
      ],
    },
  },
  argTypes: {
    leftLabel: { control: "text" },
    rightLabel: { control: "text" },
    tone: { control: { type: "inline-radio" }, options: ["dark", "light"] },
    size: { control: { type: "inline-radio" }, options: ["sm", "md"] },
  },
};

export default meta;

type Story = StoryObj<typeof SwipeBarInstruction>;

export const Default: Story = {
  args: {
    leftLabel: "SWIPE",
    rightLabel: "TO EXPLORE",
    tone: "dark",
    size: "md",
  },
};

export const LightOnLight: Story = {
  args: {
    leftLabel: "SWIPE",
    rightLabel: "TO CONTINUE",
    tone: "light",
    size: "md",
  },
  parameters: {
    backgrounds: { default: "light" },
  },
};

export const Small: Story = {
  args: {
    leftLabel: "SWIPE",
    rightLabel: "TO VIEW",
    size: "sm",
  },
};
