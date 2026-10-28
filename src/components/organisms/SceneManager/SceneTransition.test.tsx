import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SceneTransition from "./SceneTransition";
import styles from "./SceneTransition.module.scss";

function StatefulScene({ name }: { name: string }) {
  const [fading, setFading] = useState(false);
  return (
    <div>
      <p>
        {name} {fading ? "fading" : "ready"}
      </p>
      <button onClick={() => setFading(true)}>Fade {name}</button>
    </div>
  );
}
function scene(name: string) {
  return (
    <SceneTransition activeSceneKey={name}>
      <StatefulScene name={name} />
    </SceneTransition>
  );
}

describe("SceneTransition", () => {
  it("starts a fresh instance when a scene is re-entered before its exit finishes", () => {
    const view = render(scene("answer"));
    fireEvent.click(screen.getByRole("button", { name: "Fade answer" }));
    expect(screen.getByText("answer fading")).toBeInTheDocument();
    view.rerender(scene("question"));
    view.rerender(scene("answer"));
    // Complete the transition to the question, which starts the queued answer.
    fireEvent.animationEnd(
      view.container.querySelector(`.${styles.fade_fast}`)!,
    );
    expect(screen.getByText("answer ready")).toBeInTheDocument();
    expect(screen.queryByText("answer fading")).not.toBeInTheDocument();
    fireEvent.animationEnd(
      view.container.querySelector(`.${styles.fade_fast}`)!,
    );
    expect(screen.queryByText("question ready")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Fade answer" })).toHaveLength(
      1,
    );
  });

  it("ignores child animations and removes the outgoing scene only when the wrapper finishes", () => {
    const view = render(scene("opening"));
    view.rerender(scene("question"));
    fireEvent.animationEnd(
      screen.getByRole("button", { name: "Fade question" }),
    );
    expect(screen.getByText("opening ready")).toBeInTheDocument();
    fireEvent.animationEnd(
      view.container.querySelector(`.${styles.fade_fast}`)!,
    );
    expect(screen.queryByText("opening ready")).not.toBeInTheDocument();
    expect(screen.getByText("question ready")).toBeInTheDocument();
  });
});
