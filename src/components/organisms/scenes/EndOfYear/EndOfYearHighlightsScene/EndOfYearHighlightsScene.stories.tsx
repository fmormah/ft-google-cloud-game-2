import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import EndOfYearHighlightsScene from "./EndOfYearHighlightsScene";
import { CursorProvider } from "@/contexts/CursorContext";
import { GameStoreProvider } from "@/store/GameStore";

const meta: Meta<typeof EndOfYearHighlightsScene> = {
  title: "Organisms/Scenes/EndOfYear/EndOfYearHighlightsScene",
  component: EndOfYearHighlightsScene,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <GameStoreProvider
        initialValues={{
          activeScene: "report",
          selectedCharacterIndex: 0,
          totalScore: 923,
          chosenActionIcons: ["graph_5", "graph_3", "build"],
          attemptResults: {
            "0:0": {
              scenarioKey: "0:0",
              questionIndex: 0,
              selectedIndex: 1,
              pointsImpact: 25,
              isCorrect: true,
              videoSrc:
                "/assets/video/scene_videos/character_0_scenarios/scenario_0/post_action_vids/index_0.mp4",
            },
            "0:1": {
              scenarioKey: "0:1",
              questionIndex: 1,
              selectedIndex: 0,
              pointsImpact: 25,
              isCorrect: true,
              videoSrc:
                "/assets/video/scene_videos/character_0_scenarios/scenario_0/post_action_vids/index_0.mp4",
            },
            "0:3": {
              scenarioKey: "0:3",
              questionIndex: 3,
              selectedIndex: 0,
              pointsImpact: 15,
              isCorrect: true,
              videoSrc:
                "/assets/video/scene_videos/character_0_scenarios/scenario_0/post_action_vids/index_0.mp4",
            },
          },
        }}
      >
        <CursorProvider>
          <Story />
        </CursorProvider>
      </GameStoreProvider>
    ),
  ],
  args: {
    backgroundImageSrc: "/assets/images/scene-manager-bg-1.webp",
    initialStage: "intro",
    onHome: () => {}, // prevent Storybook reloads
    reportProps: {
      videoSrc: "/assets/video/correct_post_action_video.mp4",
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
  },
};

export default meta;

type Story = StoryObj<typeof EndOfYearHighlightsScene>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <EndOfYearHighlightsScene {...args} />
    </div>
  ),
};
