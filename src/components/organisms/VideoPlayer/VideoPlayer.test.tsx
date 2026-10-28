import { render } from "@testing-library/react";
import React from "react";
import VideoPlayer from "./VideoPlayer";

describe("VideoPlayer", () => {
  it("renders a video element", () => {
    const { container } = render(
      <VideoPlayer src="/assets/video/sample.mp4" />
    );
    const video = container.querySelector("video");
    expect(video).toBeTruthy();
  });
});
