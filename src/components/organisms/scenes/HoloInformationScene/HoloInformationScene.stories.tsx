import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import HoloInformationScene from "./HoloInformationScene";
import { CursorProvider } from "@/contexts/CursorContext";

const meta: Meta<typeof HoloInformationScene> = {
  title: "Organisms/Scenes/HoloInformationScene",
  component: HoloInformationScene,
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

type Story = StoryObj<typeof HoloInformationScene>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <HoloInformationScene
        {...args}
        onNext={() => console.log("NEXT pressed")}
      />
    </div>
  ),
};
