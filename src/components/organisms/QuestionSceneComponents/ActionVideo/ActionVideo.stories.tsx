import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import ActionVideo, { type ActionVideoProps } from "./ActionVideo";
import { CursorProvider } from "@/contexts/CursorContext";

const meta: Meta<typeof ActionVideo> = {
  title: "Organisms/QuestionSceneComponents/ActionVideo",
  component: ActionVideo,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <CursorProvider>
        <Story />
      </CursorProvider>
    ),
  ],
  args: {
    videoSrc: "public/assets/video/action_video_sample.mp4",
  },
  argTypes: {
    videoSrc: { control: "text" },
    muted: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof ActionVideo>;

export const Default: Story = {
  render: (args) => (
    <ActionVideo
      {...(args as ActionVideoProps)}
      onComplete={() => console.log("ActionVideo complete")}
    />
  ),
};
