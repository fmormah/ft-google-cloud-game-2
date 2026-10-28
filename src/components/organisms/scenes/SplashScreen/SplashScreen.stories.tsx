import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import SplashScreen from "./SplashScreen";
import { CursorProvider } from "@/contexts/CursorContext";

const meta: Meta<typeof SplashScreen> = {
  title: "Organisms/Scenes/SplashScreen",
  component: SplashScreen,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <CursorProvider>
        <Story />
      </CursorProvider>
    ),
  ],
  args: {
    variant: "default",
    headingHtml: "Transforming<br/>Business",
    primaryIrisColor: "#ffffff",
    secondaryIrisColor: "#ffffff",
    topTrailColor: "#ffffff",
    topTrailLineHeightPx: 5,
    topTrailLineWidthPx: 1,
    topTrailGapPx: 11,
    topTrailDurationSec: 10,
    topTrailDirection: "ltr",
    bottomTrailColor: "#ffffff",
    bottomTrailLineHeightPx: 5,
    bottomTrailLineWidthPx: 1,
    bottomTrailGapPx: 11,
    bottomTrailDurationSec: 10,
    bottomTrailDirection: "rtl",
  },
  argTypes: {
    variant: { control: { type: "radio" }, options: ["default", "minimal"] },
    headingHtml: { control: "text" },
    primaryIrisDashLength: {
      control: { type: "number", min: 2, max: 40, step: 1 },
    },
    primaryIrisDashHeight: {
      control: { type: "number", min: 1, max: 8, step: 1 },
    },
    primaryIrisGapLength: {
      control: { type: "number", min: 1, max: 40, step: 1 },
    },
    primaryIrisRotationSpeedSec: {
      control: { type: "number", min: 1, max: 60, step: 1 },
    },
    primaryIrisColor: { control: "color" },
    primaryIrisDirection: {
      control: { type: "radio" },
      options: ["clockwise", "counter-clockwise"],
    },
    secondaryIrisDashLength: {
      control: { type: "number", min: 2, max: 40, step: 1 },
    },
    secondaryIrisDashHeight: {
      control: { type: "number", min: 1, max: 8, step: 1 },
    },
    secondaryIrisGapLength: {
      control: { type: "number", min: 1, max: 40, step: 1 },
    },
    secondaryIrisRotationSpeedSec: {
      control: { type: "number", min: 1, max: 60, step: 1 },
    },
    secondaryIrisColor: { control: "color" },
    secondaryIrisDirection: {
      control: { type: "radio" },
      options: ["clockwise", "counter-clockwise"],
    },
    topTrailColor: { control: "color" },
    topTrailLineHeightPx: {
      control: { type: "number", min: 1, max: 20, step: 1 },
    },
    topTrailLineWidthPx: {
      control: { type: "number", min: 1, max: 10, step: 1 },
    },
    topTrailGapPx: { control: { type: "number", min: 1, max: 40, step: 1 } },
    topTrailDurationSec: {
      control: { type: "number", min: 1, max: 60, step: 1 },
    },
    topTrailDirection: { control: { type: "radio" }, options: ["ltr", "rtl"] },
    bottomTrailColor: { control: "color" },
    bottomTrailLineHeightPx: {
      control: { type: "number", min: 1, max: 20, step: 1 },
    },
    bottomTrailLineWidthPx: {
      control: { type: "number", min: 1, max: 10, step: 1 },
    },
    bottomTrailGapPx: { control: { type: "number", min: 1, max: 40, step: 1 } },
    bottomTrailDurationSec: {
      control: { type: "number", min: 1, max: 60, step: 1 },
    },
    bottomTrailDirection: {
      control: { type: "radio" },
      options: ["ltr", "rtl"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof SplashScreen>;

export const Default: Story = {
  args: {
    variant: "default",
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
    bottomTrailLineHeightPx: 10,
    bottomTrailGapPx: 21,
    topTrailLineHeightPx: 10,
    topTrailGapPx: 21,
    topTrailDurationSec: 0.4,
    bottomTrailDurationSec: 0.5,
  },

  render: (args) => (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <SplashScreen {...args} />
    </div>
  ),
};

export const MinimalNoPrimarySecondaryIris: Story = {
  args: {
    variant: "minimal",
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
    bottomTrailLineHeightPx: 10,
    bottomTrailGapPx: 21,
    topTrailLineHeightPx: 10,
    topTrailGapPx: 21,
    topTrailDurationSec: 0.4,
    bottomTrailDurationSec: 0.5,
  },
  render: (args) => (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <SplashScreen {...args} />
    </div>
  ),
};
