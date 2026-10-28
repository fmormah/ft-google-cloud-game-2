import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import HologramDisplay from "./HologramDisplay";

const meta: Meta<typeof HologramDisplay> = {
  title: "Molecules/HologramDisplay",
  component: HologramDisplay,
  tags: ["autodocs"],
  args: {
    videoSrc: "/assets/video/sample_video.mp4",
  },
};

export default meta;

type Story = StoryObj<typeof HologramDisplay>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 700, height: 700 }}>
      <HologramDisplay {...args}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "white",
          }}
        >
          <p>Children content goes here</p>
        </div>
      </HologramDisplay>
    </div>
  ),
};
