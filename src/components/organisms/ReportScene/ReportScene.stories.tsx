import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import ReportScene, { type ReportSceneProps } from "./ReportScene";
import { CursorProvider } from "@/contexts/CursorContext";
import { GameStoreProvider } from "@/store/GameStore";

const meta: Meta<typeof ReportScene> = {
  title: "Organisms/ReportScene",
  component: ReportScene,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <GameStoreProvider
        initialValues={{
          activeScene: "report",
          selectedCharacterIndex: 0,
          totalScore: 923,
          chosenActionIcons: ["graph_5", "graph_3", "build"],
        }}
      >
        <CursorProvider>
          <Story />
        </CursorProvider>
      </GameStoreProvider>
    ),
  ],
  args: {
    videoSrc: "/assets/video/correct_post_action_video.mp4",
    reportTitle: "Incident Report",
    reportBody: "Summary details and key insights appear here for the report.",
  },
  argTypes: {
    videoSrc: { control: "text" },
    reportTitle: { control: "text" },
    reportBody: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof ReportScene>;

export const Default: Story = {
  render: (args) => <ReportScene {...(args as ReportSceneProps)} />,
};
