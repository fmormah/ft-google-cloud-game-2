import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import CareersHighlightIntroScene from "./CareersHighlightIntroScene";
import { CursorProvider } from "@/contexts/CursorContext";

const meta: Meta<typeof CareersHighlightIntroScene> = {
  title: "Organisms/Scenes/EndOfYear/CareersHighlightIntroScene",
  component: CareersHighlightIntroScene,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <CursorProvider>
        <Story />
      </CursorProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof CareersHighlightIntroScene>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <CareersHighlightIntroScene {...args} />
    </div>
  ),
  args: {
    title: "Explore career journeys",
    description:
      "Discover how teams across the organisation have used cloud technology to transform their work this year.",
    startHighlightsLabel: "START HIGHLIGHTS",
    backgroundVideoSources: [
      "/assets/video/sample_video.mp4",
      "/assets/video/scenario_vid_sample.mp4",
      "/assets/video/action_video_sample.mp4",
    ],
    onHome: () => {},
  },
};


