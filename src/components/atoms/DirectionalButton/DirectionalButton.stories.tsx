import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import DirectionalButton, {
  type DirectionalButtonProps,
} from "./DirectionalButton";
import { CursorProvider } from "@/contexts/CursorContext";

const meta: Meta<typeof DirectionalButton> = {
  title: "Atoms/DirectionalButton",
  component: DirectionalButton,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <CursorProvider>
        <Story />
      </CursorProvider>
    ),
  ],
  args: {
    label: "Continue" satisfies DirectionalButtonProps["label"],
    direction: "right",
  },
  argTypes: {
    label: { control: "text" },
    direction: { control: { type: "radio" }, options: ["left", "right"] },
  },
};

export default meta;

type Story = StoryObj<typeof DirectionalButton>;

export const Right: Story = {
  args: {
    label: "Continue" satisfies DirectionalButtonProps["label"],
    direction: "right",
  },
};

export const Left: Story = {
  args: {
    label: "Rewind" satisfies DirectionalButtonProps["label"],
    direction: "left",
  },
};

export const AsLink: Story = {
  args: {
    label: "Continue" satisfies DirectionalButtonProps["label"],
    direction: "right",
    as: "a",
    href: "https://example.com/",
  },
};
