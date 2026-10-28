import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { GameStoreProvider } from "@/store/GameStore";
import SceneManager from "./SceneManager";

const meta: Meta<typeof SceneManager> = {
  title: "Organisms/SceneManager",
  component: SceneManager,
};

export default meta;

type Story = StoryObj<typeof SceneManager>;

export const Default: Story = {
  render: () => (
    <GameStoreProvider>
      <div className="game-container">
        <SceneManager />
      </div>
    </GameStoreProvider>
  ),
};
