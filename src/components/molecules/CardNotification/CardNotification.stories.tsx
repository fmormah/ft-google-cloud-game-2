import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React, { useRef } from "react";
import CardNotification, {
  type CardNotificationHandle,
} from "./CardNotification";

const meta: Meta<typeof CardNotification> = {
  title: "Molecules/CardNotification",
  component: CardNotification,
  tags: ["autodocs"],
  args: {
    label: "Card Label",
    variant: "default",
  },
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["default", "positive", "negative"],
    },
    label: { control: "text" },
    iconName: { control: "text" },
    percentage: { control: "number" },
    hasAnimation: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof CardNotification>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {
    label: "New Alert",
    iconName: "crisis_alert",
  },
};

export const Positive: Story = {
  args: {
    label: "Market Up",
    variant: "positive",
    percentage: 1.15,
  },
};

export const Negative: Story = {
  args: {
    label: "Market Down",
    variant: "negative",
    percentage: -2.3,
  },
};

export const DefaultPositiveArrow: Story = {
  args: {
    label: "Default + Up Arrow",
    variant: "default",
    percentage: 1.2,
  },
};

export const DefaultNegativeArrow: Story = {
  args: {
    label: "Default + Down Arrow",
    variant: "default",
    percentage: -1.2,
  },
};

const TriggerTemplate: React.FC<
  React.ComponentProps<typeof CardNotification>
> = (args) => {
  const ref = useRef<CardNotificationHandle>(null);
  return (
    <div>
      <CardNotification ref={ref} {...args} />
      <div style={{ marginTop: 16 }}>
        <button onClick={() => ref.current?.trigger()}>
          Trigger Animation
        </button>
      </div>
    </div>
  );
};

export const AnimatedPositive: Story = {
  render: (args) => <TriggerTemplate {...args} />,
  args: {
    hasAnimation: true,
    label: "Animated Positive",
    variant: "positive",
    percentage: 2.5,
  },
};

export const AnimatedNegative: Story = {
  render: (args) => <TriggerTemplate {...args} />,
  args: {
    hasAnimation: true,
    label: "Animated Negative",
    variant: "negative",
    percentage: -2.5,
  },
};
