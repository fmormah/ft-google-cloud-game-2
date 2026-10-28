import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import ActionVideo from "./ActionVideo";

describe("ActionVideo", () => {
  it("renders a video and calls onComplete when ended", () => {
    const onComplete = vi.fn();
    const { container } = render(
      <ActionVideo
        videoSrc="public/assets/video/correct_post_action_video.mp4"
        onComplete={onComplete}
      />
    );
    const video = container.querySelector("video");
    expect(video).toBeTruthy();
    fireEvent(video as Element, new Event("ended"));
    expect(onComplete).toHaveBeenCalled();
  });

  it("calls onComplete when clicking SKIP VIDEO", () => {
    const onComplete = vi.fn();
    render(
      <ActionVideo
        videoSrc="public/assets/video/correct_post_action_video.mp4"
        onComplete={onComplete}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /skip video/i }));
    expect(onComplete).toHaveBeenCalled();
  });
});
