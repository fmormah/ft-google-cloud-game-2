import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import OrientationPrompt from ".";
import styles from "./OrientationPrompt.module.scss";

const meta: Meta = {
  title: "Utility/OrientationPrompt",
  component: OrientationPrompt,
  parameters: {
    layout: "fullscreen",
    viewport: {
      defaultViewport: "iphonex",
      orientation: "landscape",
    },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <>
      <style>{`.${styles.overlay}{display:grid;}`}</style>
      <OrientationPrompt />
    </>
  ),
};

