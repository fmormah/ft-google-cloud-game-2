import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React, { useRef, useEffect, useState } from "react";
import VideoPlayer, { type VideoPlayerHandle } from "./VideoPlayer";

const meta: Meta<typeof VideoPlayer> = {
  title: "Organisms/VideoPlayer",
  component: VideoPlayer,
  tags: ["autodocs"],
  args: {
    src: "/assets/video/sample_video.mp4",
    hlsSrc: "",
    preload: "metadata",
  },
  argTypes: {
    src: { control: "text" },
    hlsSrc: { control: "text" },
    preload: {
      control: { type: "select" },
      options: ["none", "metadata", "auto"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof VideoPlayer>;

type TemplateArgs = React.ComponentProps<typeof VideoPlayer>;
const Template = (args: TemplateArgs) => {
  const ref = useRef<VideoPlayerHandle>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const rateRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState({
    time: 0,
    paused: true,
    looping: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (ref.current) {
        setStatus({
          time: ref.current.getCurrentTime(),
          paused: ref.current.isPaused(),
          looping: ref.current.isLooping(),
        });
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        color: "white",
        background: "rgba(0,0,0,0.7)",
        padding: 16,
        borderRadius: 8,
      }}
    >
      <VideoPlayer ref={ref} {...args} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <button onClick={() => ref.current?.play()}>Play</button>
        <button onClick={() => ref.current?.pause()}>Pause</button>
        <button onClick={() => ref.current?.toggleLoop()}>Toggle Loop</button>
      </div>
      <div
        style={{
          marginTop: 12,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          ref={timeRef}
          type="number"
          defaultValue="5"
          style={{ width: 60 }}
        />
        <input
          ref={rateRef}
          type="number"
          defaultValue="4"
          style={{ width: 60 }}
        />
        <button
          onClick={() =>
            ref.current?.transitionToIndex(
              Number(timeRef.current?.value),
              Number(rateRef.current?.value)
            )
          }
        >
          Transition
        </button>
        <button
          onClick={() =>
            ref.current?.transitionToIndexHold(
              Number(timeRef.current?.value),
              Number(rateRef.current?.value)
            )
          }
        >
          Transition & Hold
        </button>
        <button
          onClick={() => ref.current?.skipTo(Number(timeRef.current?.value))}
        >
          Skip
        </button>
      </div>
      <div style={{ marginTop: 12, fontFamily: "monospace", fontSize: 12 }}>
        <p>Time: {status.time.toFixed(2)}s</p>
        <p>Paused: {status.paused ? "Yes" : "No"}</p>
        <p>Looping: {status.looping ? "Yes" : "No"}</p>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
};
