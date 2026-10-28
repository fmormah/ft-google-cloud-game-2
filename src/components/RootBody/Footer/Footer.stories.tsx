import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Footer from "./index";

const meta: Meta<typeof Footer> = {
  title: "FT/Footer",
  component: Footer,
};

export default meta;

type Story = StoryObj<typeof Footer>;

export const Default: Story = {
  render: () => <Footer />,
};

