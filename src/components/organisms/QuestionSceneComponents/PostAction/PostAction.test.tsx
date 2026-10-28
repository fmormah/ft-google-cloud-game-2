import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import PostAction from "./PostAction";

describe("PostAction", () => {
  it("renders video, info and fires CTA callbacks", () => {
    const onRewind = vi.fn();
    const onContinue = vi.fn();

    const { container } = render(
      <PostAction
        notificationLabel="ACTION COMPLETE"
        infoTitle="Post Action Summary"
        infoBody="Outcome details"
        onRewind={onRewind}
        onContinue={onContinue}
      />
    );

    const video = container.querySelector("video");
    expect(video).toBeTruthy();

    expect(screen.getByText(/post action summary/i)).toBeInTheDocument();
    expect(screen.getByText(/outcome details/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /rewind/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(onRewind).toHaveBeenCalled();
    expect(onContinue).toHaveBeenCalled();
  });

  it("uses report CTA label when last question", () => {
    const onContinue = vi.fn();

    render(
      <PostAction
        notificationLabel="ACTION COMPLETE"
        infoTitle="Post Action Summary"
        infoBody="Outcome details"
        onContinue={onContinue}
        isLastQuestion
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /see how you did/i })
    );
    expect(onContinue).toHaveBeenCalled();
  });

  it("applies positive variant styles", () => {
    const { container } = render(
      <PostAction
        notificationLabel="SUCCESS"
        infoTitle="Good"
        infoBody="Great"
        variant="positive"
      />
    );
    const card =
      screen.getByText(/success/i).closest(".CardNotification") ||
      (screen.getByText(/success/i).closest("div")
        ?.parentElement as HTMLElement | null);
    expect(card?.className).toMatch(/variant--positive/);
    const info = container.querySelector('[class*="InfoCard"]');
    expect(info?.className).toMatch(/InfoCard--positive/);
  });

  it("applies negative variant styles", () => {
    const { container } = render(
      <PostAction
        notificationLabel="ALERT"
        infoTitle="Bad"
        infoBody="Worse"
        variant="negative"
      />
    );
    const card =
      screen.getByText(/alert/i).closest(".CardNotification") ||
      (screen.getByText(/alert/i).closest("div")
        ?.parentElement as HTMLElement | null);
    expect(card?.className).toMatch(/variant--negative/);
    const info = container.querySelector('[class*="InfoCard"]');
    expect(info?.className).toMatch(/InfoCard--negative/);
  });

  it("animates CardNotification when notificationPercentChange provided (positive)", () => {
    render(
      <PostAction
        notificationLabel="Market Up"
        infoTitle="Up"
        infoBody="Up body"
        notificationPercentChange={1.5}
      />
    );
    const card =
      screen.getByText(/market up/i).closest(".CardNotification") ||
      (screen.getByText(/market up/i).closest("div")
        ?.parentElement as HTMLElement | null);
    expect(card?.className).toMatch(/animated/);
    expect(card?.className).toMatch(/is-positive/);
  });

  it("animates CardNotification when notificationPercentChange provided (negative)", () => {
    render(
      <PostAction
        notificationLabel="Market Down"
        infoTitle="Down"
        infoBody="Down body"
        notificationPercentChange={-2}
      />
    );
    const card =
      screen.getByText(/market down/i).closest(".CardNotification") ||
      (screen.getByText(/market down/i).closest("div")
        ?.parentElement as HTMLElement | null);
    expect(card?.className).toMatch(/animated/);
    expect(card?.className).toMatch(/is-negative/);
  });

  it("hides CardNotification left element on re-answer attempts", () => {
    render(
      <PostAction
        notificationLabel="Market Up"
        infoTitle="Up"
        infoBody="Up body"
        notificationPercentChange={1.5}
        hideNotificationLeftElement
      />
    );
    const card =
      screen.getByText(/market up/i).closest(".CardNotification") ||
      (screen.getByText(/market up/i).closest("div")
        ?.parentElement as HTMLElement | null);
    expect(card?.className).toMatch(/hideLeftElement/);
  });
});
