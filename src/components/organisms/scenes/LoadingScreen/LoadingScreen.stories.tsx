import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React, { useRef } from "react";
import LoadingScreen, { type LoadingScreenHandle } from "./LoadingScreen";

const meta: Meta<typeof LoadingScreen> = {
  title: "Organisms/Scenes/LoadingScreen",
  component: LoadingScreen,
  tags: ["autodocs"],
  args: {
    type: "transient",
    message: "[CLICK ANYWHERE TO ENABLE SOUND]",
    primaryIrisDashLength: 10,
    primaryIrisDashHeight: 2,
    primaryIrisGapLength: 5,
    primaryIrisRotationSpeedSec: 10,
    primaryIrisColor: "#ffffff",
    primaryIrisDirection: "clockwise",
    secondaryIrisDashLength: 10,
    secondaryIrisDashHeight: 2,
    secondaryIrisGapLength: 5,
    secondaryIrisRotationSpeedSec: 10,
    secondaryIrisColor: "#ffffff",
    secondaryIrisDirection: "counter-clockwise",
  },
  argTypes: {
    type: { control: { type: "radio" }, options: ["transient", "persistent"] },
    message: { control: "text" },
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
  },
};

export default meta;

type Story = StoryObj<typeof LoadingScreen>;

const DefaultTemplate: React.FC<React.ComponentProps<typeof LoadingScreen>> = (
  args
) => {
  const ref = useRef<LoadingScreenHandle>(null);
  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <LoadingScreen
        ref={ref}
        {...args}
        onSequenceComplete={() => alert("Sequence complete")}
      />
      <div style={{ position: "absolute", bottom: 16, left: 16, zIndex: 10 }}>
        <button onClick={() => ref.current?.startSequence()}>
          Start Sequence
        </button>
      </div>
    </div>
  );
};

export const Default: Story = {
  args: {
    type: "transient",
    primaryIrisDashLength: 2,
    primaryIrisDashHeight: 1,
    primaryIrisRotationSpeedSec: 60,
    secondaryIrisDashLength: 5,
    secondaryIrisDashHeight: 1,
    secondaryIrisGapLength: 14,
    secondaryIrisRotationSpeedSec: 60,
  },
  render: (args) => <DefaultTemplate {...args} />,
};

export const Persistent: Story = {
  args: {
    type: "persistent",
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
  render: (args) => <DefaultTemplate {...args} />,
};
