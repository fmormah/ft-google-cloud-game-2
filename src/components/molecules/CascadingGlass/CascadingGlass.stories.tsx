import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React, { useRef } from "react";
import CascadingGlass, { type CascadingGlassHandle } from "./CascadingGlass";

const meta: Meta<typeof CascadingGlass> = {
  title: "Molecules/CascadingGlass",
  component: CascadingGlass,
  tags: ["autodocs"],
  args: {
    tileCount: 64,
    flipSpeedSec: 0.6,
    totalDurationSec: 2,
    flipDirection: "diagonal",
    sheenDurationSec: 0.8,
    sheenWidthPercent: 50,
    sheenOpacity: 0.25,
    sheenBlurPx: 5,
  },
  argTypes: {
    tileCount: { control: { type: "number", min: 4, max: 256, step: 1 } },
    flipSpeedSec: { control: { type: "number", min: 0.1, max: 5, step: 0.1 } },
    totalDurationSec: {
      control: { type: "number", min: 0.5, max: 10, step: 0.1 },
    },
    flipDirection: {
      control: { type: "select" },
      options: ["diagonal", "horizontal", "vertical", "combo"],
    },
    sheenDurationSec: {
      control: { type: "number", min: 0.2, max: 3, step: 0.1 },
    },
    sheenWidthPercent: {
      control: { type: "number", min: 10, max: 150, step: 5 },
    },
    sheenOpacity: { control: { type: "number", min: 0, max: 1, step: 0.05 } },
    sheenBlurPx: { control: { type: "number", min: 0, max: 50, step: 1 } },
  },
};

export default meta;

type Story = StoryObj<typeof CascadingGlass>;

const DefaultTemplate: React.FC<React.ComponentProps<typeof CascadingGlass>> = (
  args
) => {
  const ref = useRef<CascadingGlassHandle>(null);
  return (
    <div style={{ width: 400, height: 400 }}>
      <CascadingGlass ref={ref} {...args} />
      <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
        <button onClick={() => ref.current?.trigger()}>Flip Tiles</button>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: (args) => <DefaultTemplate {...args} />,
};
