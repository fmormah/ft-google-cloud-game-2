import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { CursorProvider } from "@/contexts/CursorContext";
import OpeningScene2 from "./OpeningScene2";

const meta: Meta<typeof OpeningScene2> = {
  title: "Organisms/Scenes/OpeningScene2",
  component: OpeningScene2,
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

type Story = StoryObj<typeof OpeningScene2>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <OpeningScene2
        {...args}
        onPrimaryAction={() => console.log("Primary CTA triggered")}
        onLoadingTap={() => console.log("Loading tapped")}
      />
    </div>
  ),
  args: {
    initialDelaySec: 5,
    afterFadeDelaySec: 2,
    tilePlaybackRate: 3,

    splashProps: {
      "headingHtml": "Transforming<br/>Business",
      "primaryIrisColor": "#ffffff",
      "secondaryIrisColor": "#ffffff",
      "topTrailColor": "#ffffff",
      "topTrailLineHeightPx": 10,
      "topTrailLineWidthPx": 1,
      "topTrailGapPx": 21,
      "topTrailDurationSec": 0.4,
      "topTrailDirection": "ltr",
      "bottomTrailColor": "#ffffff",
      "bottomTrailLineHeightPx": 10,
      "bottomTrailLineWidthPx": 1,
      "bottomTrailGapPx": 21,
      "bottomTrailDurationSec": 0.5,
      "bottomTrailDirection": "rtl",
      "primaryIrisDashLength": 2,
      "primaryIrisDashHeight": 1,
      "primaryIrisGapLength": 5,
      "secondaryIrisDashLength": 5,
      "secondaryIrisDashHeight": 1,
      "secondaryIrisGapLength": 14,
      "secondaryIrisRotationSpeedSec": 60,
      "primaryIrisRotationSpeedSec": 60,
      "primaryIrisDirection": "clockwise",
      "secondaryIrisDirection": "counter-clockwise"
    },

    loadingProps: {
      "message": "[CLICK ANYWHERE TO ENABLE SOUND]",
      "primaryIrisDashLength": 2,
      "primaryIrisDashHeight": 1,
      "primaryIrisGapLength": 5,
      "primaryIrisRotationSpeedSec": 60,
      "primaryIrisColor": "#ffffff",
      "primaryIrisDirection": "clockwise",
      "secondaryIrisDashLength": 5,
      "secondaryIrisDashHeight": 1,
      "secondaryIrisGapLength": 14,
      "secondaryIrisRotationSpeedSec": 60,
      "secondaryIrisColor": "#ffffff",
      "secondaryIrisDirection": "counter-clockwise"
    },

    backgroundVideoSrc:
      "/assets/video/scene_videos/opening-splash_Video_converted.webm" // Storybook uses webm by default
  },
};
