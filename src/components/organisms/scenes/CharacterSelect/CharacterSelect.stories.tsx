import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import CharacterSelect from "./CharacterSelect";
import { CursorProvider } from "@/contexts/CursorContext";

const meta: Meta<typeof CharacterSelect> = {
  title: "Organisms/Scenes/CharacterSelect",
  component: CharacterSelect,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof CharacterSelect>;

export const Default: Story = {
  render: (args) => (
    <CursorProvider>
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <CharacterSelect
          {...args}
          onCharacterSelect={(p) => console.log("Select character:", p)}
          onNext={(i) => console.log("Next index:", i)}
          onBack={(i) => console.log("Prev index:", i)}
        />
      </div>
    </CursorProvider>
  ),
  args: {
    initialIndex: 0,
    deferUiUntilVideoEnd: true,
  },
};
