import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import QuestionSceneShell, {
  type QuestionSceneShellProps,
} from "./QuestionSceneShell";
import { CursorProvider } from "@/contexts/CursorContext";

const meta: Meta<typeof QuestionSceneShell> = {
  title: "Organisms/QuestionSceneComponents/QuestionSceneShell",
  component: QuestionSceneShell,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <CursorProvider>
        <Story />
      </CursorProvider>
    ),
  ],
  args: {
    videoSrc:
      "public/assets/video/scene_videos/character_0_scenarios/scenario_0/index.mp4",
    cardLabel: "ENGINE RUNNING",
    cardIconName: "admin_panel_settings",
    infoTitle: "Security Breach at Edge Location",
    infoBody:
      "A sensor anomaly suggests unauthorized access. Review available actions.",
    actions: [
      { id: "a", label: "Investigate", iconName: "rule" },
      { id: "b", label: "Isolate", iconName: "admin_panel_settings" },
      { id: "c", label: "Report", iconName: "article" },
    ],
  },
  argTypes: {
    videoSrc: { control: "text" },
    cardLabel: { control: "text" },
    infoTitle: { control: "text" },
    infoBody: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof QuestionSceneShell>;

export const Default: Story = {
  render: (args) => (
    <QuestionSceneShell {...(args as QuestionSceneShellProps)} />
  ),
};
