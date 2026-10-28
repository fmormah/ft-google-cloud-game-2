import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { CursorProvider } from "@/contexts/CursorContext";
import OpeningScene from "./OpeningScene";

const meta: Meta<typeof OpeningScene> = {
  title: "Organisms/Scenes/OpeningScene",
  component: OpeningScene,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <CursorProvider>
        <Story />
      </CursorProvider>
    ),
  ],
  args: {
    initialDelaySec: 5,
    afterFadeDelaySec: 2,
    loadingProps: {
      message: "[CLICK ANYWHERE TO ENABLE SOUND]",
      primaryIrisDashLength: 2,
      primaryIrisDashHeight: 1,
      primaryIrisGapLength: 5,
      primaryIrisRotationSpeedSec: 60,
      primaryIrisColor: "#ffffff",
      primaryIrisDirection: "clockwise",
      secondaryIrisDashLength: 5,
      secondaryIrisDashHeight: 1,
      secondaryIrisGapLength: 14,
      secondaryIrisRotationSpeedSec: 60,
      secondaryIrisColor: "#ffffff",
      secondaryIrisDirection: "counter-clockwise",
    },
    splashProps: {
      headingHtml: "Transforming<br/>Business",
      primaryIrisColor: "#ffffff",
      secondaryIrisColor: "#ffffff",
      topTrailColor: "#ffffff",
      topTrailLineHeightPx: 10,
      topTrailLineWidthPx: 1,
      topTrailGapPx: 21,
      topTrailDurationSec: 0.4,
      topTrailDirection: "ltr",
      bottomTrailColor: "#ffffff",
      bottomTrailLineHeightPx: 10,
      bottomTrailLineWidthPx: 1,
      bottomTrailGapPx: 21,
      bottomTrailDurationSec: 0.5,
      bottomTrailDirection: "rtl",
      primaryIrisDashLength: 2,
      primaryIrisDashHeight: 1,
      primaryIrisGapLength: 5,
      secondaryIrisDashLength: 5,
      secondaryIrisDashHeight: 1,
      secondaryIrisGapLength: 14,
      secondaryIrisRotationSpeedSec: 60,
      primaryIrisRotationSpeedSec: 60,
      primaryIrisDirection: "clockwise",
      secondaryIrisDirection: "counter-clockwise",
    },
  },
  argTypes: {
    initialDelaySec: {
      control: { type: "number", min: 0, max: 20, step: 0.5 },
    },
    afterFadeDelaySec: {
      control: { type: "number", min: 0, max: 10, step: 0.5 },
    },
  },
};

export default meta;

type Story = StoryObj<typeof OpeningScene>;

export const Default: Story = {
  args: {
    backgroundVideoSrc:
      "/assets/video/scene_videos/opening-splash_Video_converted.webm", // Storybook uses webm by default

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
      "bottomTrailDurationSec": 50,
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
    }
  },

  render: (args) => (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <OpeningScene
        {...args}
        onLoadingTap={() => console.log("LoadingScreen tapped")}
        onPrimaryAction={() => console.log("Primary action triggered")}
      />
    </div>
  )
};
