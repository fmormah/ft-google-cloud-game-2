import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Headers from "./index";

const meta: Meta<typeof Headers> = {
  title: "FT/Headers",
  component: Headers,
};

export default meta;

type Story = StoryObj<typeof Headers>;

export const Default: Story = {
  render: () => <Headers />,
};

