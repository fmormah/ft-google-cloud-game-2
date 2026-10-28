import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import PostAction, { type PostActionProps } from "./PostAction";
import { CursorProvider } from "@/contexts/CursorContext";

const meta: Meta<typeof PostAction> = {
  title: "Organisms/QuestionSceneComponents/PostAction",
  component: PostAction,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <CursorProvider>
        <Story />
      </CursorProvider>
    ),
  ],
  args: {
    videoSrc: "public/assets/video/correct_post_action_video.mp4",
    notificationLabel: "ACTION COMPLETE",
    infoTitle: "Perimeter Restored",
    infoBody: "All systems nominal. Proceed to the next objective.",
  },
  argTypes: {
    videoSrc: { control: "text" },
    notificationLabel: { control: "text" },
    infoTitle: { control: "text" },
    infoBody: { control: "text" },
    variant: {
      control: { type: "radio" },
      options: [undefined, "positive", "negative"],
    },
    variantClassName: { control: "text" },
    notificationPercentChange: {
      control: { type: "number", min: -100, max: 100, step: 0.1 },
    },
    isLastQuestion: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof PostAction>;

export const Default: Story = {
  render: (args) => (
    <PostAction
      {...(args as PostActionProps)}
      onRewind={() => console.log("REWIND")}
      onContinue={() => console.log("CONTINUE")}
    />
  ),
};

export const WithSceneFadeSimulation: Story = {
  render: (args) => {
    const SceneTransition =
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("@/components/organisms/SceneManager/SceneTransition").default;

    const [activeSceneKey, setActiveSceneKey] = React.useState("postAction");

    return (
      <SceneTransition activeSceneKey={activeSceneKey}>
        {activeSceneKey === "postAction" ? (
          <PostAction
            {...(args as PostActionProps)}
            onRewind={() => setActiveSceneKey("questionShell")}
            onContinue={() => console.log("CONTINUE")}
          />
        ) : (
          <div
            style={{
              height: "100%",
              width: "100%",
              background: "black",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "sans-serif",
            }}
          >
            QUESTION SHELL (simulated)
          </div>
        )}
      </SceneTransition>
    );
  },
};

export const Positive: Story = {
  args: {
    notificationLabel: "SUCCESS",
    infoTitle: "Barrier Restored",
    infoBody: "All systems nominal.",
    variant: "positive",
  },
};

export const Negative: Story = {
  args: {
    notificationLabel: "ALERT",
    infoTitle: "Perimeter Breached",
    infoBody: "Manual intervention required.",
    variant: "negative",
  },
};

export const AnimatedPositiveChange: Story = {
  args: {
    notificationLabel: "Market Up",
    infoTitle: "Performance Spike",
    infoBody: "KPIs exceeded expectations.",
    notificationPercentChange: 2.5,
    variant: "positive"
  },
};

export const AnimatedNegativeChange: Story = {
  args: {
    notificationLabel: "Market Down",
    infoTitle: "Performance Dip",
    infoBody: "KPIs below target.",
    notificationPercentChange: -1.8,
    variant: "negative"
  },
};

export const FinalQuestion: Story = {
  args: {
    notificationLabel: "FINAL QUESTION",
    infoTitle: "Mission Debrief",
    infoBody: "Review your choices and see how you did.",
    isLastQuestion: true,
  },
  render: (args) => (
    <PostAction
      {...(args as PostActionProps)}
      onRewind={() => console.log("REWIND")}
      onContinue={() => console.log("SEE HOW YOU DID")}
    />
  ),
};
