import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import InfoCard, { type InfoCardProps } from "./InfoCard";

const meta: Meta<typeof InfoCard> = {
  title: "Molecules/InfoCard",
  component: InfoCard,
  tags: ["autodocs"],
  args: {
    as: "div" as InfoCardProps["as"],
    children: (
      <div>
        <p className="p">This is an info card with content.</p>
      </div>
    ),
  },
  argTypes: {
    as: { control: { type: "select" }, options: ["div", "section", "article"] },
    variant: {
      control: { type: "select" },
      options: [undefined, "positive", "negative"],
    },
    animationVariant: {
      control: { type: "select" },
      options: [undefined, "intro"],
    },
    children: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof InfoCard>;

export const Default: Story = {};

export const Section: Story = {
  args: { as: "section" },
};

export const Article: Story = {
  args: { as: "article" },
};

export const Positive: Story = {
  args: { variant: "positive" },
};

export const Negative: Story = {
  args: { variant: "negative" },
};

export const AnimatedIntro: Story = {
  args: {
    animationVariant: "intro",
    children: (
      <div>
        <p className="p">This card animates in with a peek and bounce.</p>
      </div>
    ),
  },
};
