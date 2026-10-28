import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import QuestionSceneShell from "./QuestionSceneShell";

describe("QuestionSceneShell", () => {
  test("registers ViewA option click and commits ViewB selected option", async () => {
    const onOptionRegister = vi.fn();
    const onOptionCommit = vi.fn();
    const onActNow = vi.fn();

    const actions = [
      { id: "a", label: "Investigate" },
      { id: "b", label: "Isolate" },
      { id: "c", label: "Report" },
    ];

    render(
      <QuestionSceneShell
        actions={actions}
        onOptionRegister={onOptionRegister}
        onOptionCommit={onOptionCommit}
        onActNow={onActNow}
      />
    );

    const video = document.querySelector("video") as HTMLVideoElement;
    fireEvent.ended(video);

    const investigateBtn = await screen.findByRole("button", { name: /investigate/i });
    fireEvent.click(investigateBtn);
    expect(onOptionRegister).toHaveBeenCalledWith({
      index: 0,
      id: "a",
      label: "Investigate",
    });

    const actionsBtn = await screen.findByRole("button", { name: /actions/i });
    fireEvent.click(actionsBtn);

    const isolateButtons = await screen.findAllByRole("button", { name: /isolate/i });
    const isolateBtn =
      isolateButtons.find((el) => /optionBtn/i.test(el.className)) ||
      isolateButtons[isolateButtons.length - 1];
    fireEvent.click(isolateBtn);
    await waitFor(() => expect(isolateBtn.className).toMatch(/is-selected/));

    const actNowBtn = await screen.findByRole("button", { name: /act now/i });
    fireEvent.click(actNowBtn);
    expect(onOptionCommit).toHaveBeenCalledWith({
      selectedIndex: 1,
      selected: { id: "b", label: "Isolate" },
    });
    expect(onActNow).toHaveBeenCalled();
  });
});
