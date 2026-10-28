import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import EoYReport, { type EoYReportProps } from "./EoYReport";
import { CursorProvider } from "@/contexts/CursorContext";
import { GameStoreProvider } from "@/store/GameStore";
import { ASSETS } from "@/utils/constants";

const meta: Meta<typeof EoYReport> = {
  title: "Organisms/Scenes/EndOfYear/EoYReport",
  component: EoYReport,
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
    videoSources: ASSETS.VIDEO_SOURCES.TROPHY_GOLD,
    reportTitle: "Best year on record for Sunrise Cereals Co.",
    reportBody:
      "Thanks to your quick decision making and some help from AI, Sunrise Cereals Co. has had a record-breaking year. It’s safe to say you impressed the board, your team and customers. Someone’s getting a bonus.",
    totalGain: 150,
    totalLoss: 150,
    articleHref:
      "https://www.ft.com/partnercontent/google-cloud/how-ai-is-transforming-business.html",
    learnMoreHref:
      "https://rsvp.withgoogle.com/events/transforming-business-with-ai/forms/registration",
  },
  argTypes: {
    reportTitle: { control: "text" },
    reportBody: { control: "text" },
    totalGain: { control: { type: "number", min: 0, step: 1 } },
    totalLoss: { control: { type: "number", min: 0, step: 1 } },
    articleHref: { control: "text" },
    learnMoreHref: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof EoYReport>;

export const Default: Story = {
  render: (args) => <EoYReport {...(args as EoYReportProps)} />,
};
