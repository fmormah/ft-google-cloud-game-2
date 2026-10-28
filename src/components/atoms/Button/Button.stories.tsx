import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import Button, { type ButtonProps } from "./Button";
import { MaterialIcon, type MaterialIconName } from "@/components/atoms/Icon";
import { CursorProvider } from "@/contexts/CursorContext";

type ButtonStoryArgs = ButtonProps & { iconName?: MaterialIconName };

const ICON_OPTIONS: MaterialIconName[] = [
  "frame_person",
  "error",
  "language",
  "orbit",
  "account_circle",
  "package_2",
  "settings",
  "graph_5",
  "graph_3",
  "front_loader",
  "build",
  "checked_circle_unread",
  "rule",
  "crisis_alert",
  "admin_panel_settings",
  "grocery",
  "article",
  "stars_2",
  "browse_activity",
];

const meta: Meta<ButtonStoryArgs> = {
  title: "Atoms/Button",
  component: Button,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <CursorProvider>
        <Story />
      </CursorProvider>
    ),
  ],
  args: {
    label: "Organise a site visit" satisfies ButtonProps["label"],
    disabled: false,
    fullWidth: false,
  },
  argTypes: {
    label: { control: "text" },
    iconName: { control: { type: "select" }, options: ICON_OPTIONS },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
    selected: { control: "boolean" },
    cornerVariant: {
      control: { type: "select" },
      options: ["all", "top", "bottom"],
    },
    onClick: { action: "click" },
  },
};

export default meta;

type Story = StoryObj<ButtonStoryArgs>;

export const Default: Story = {
  render: (args) => (
    <Button
      {...args}
      icon={args.iconName ? <MaterialIcon name={args.iconName} /> : undefined}
      label={"Organise a site visit" satisfies ButtonProps["label"]}
    />
  ),
  args: {
    iconName: "language" as MaterialIconName,
  },
};

export const NoIcon: Story = {
  args: {
    label: "Continue" satisfies ButtonProps["label"],
    iconName: undefined,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled" satisfies ButtonProps["label"],
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    label: "Full Width" satisfies ButtonProps["label"],
    fullWidth: true,
  },
};

export const Selected: Story = {
  args: {
    label: "Selected" satisfies ButtonProps["label"],
    selected: true,
    iconName: "checked_circle_unread" as MaterialIconName,
  },
};

export const IconOnly: Story = {
  render: (args) => (
    <Button
      {...args}
      iconOnly
      icon={args.iconName ? <MaterialIcon name={args.iconName} /> : undefined}
      aria-label="Open"
      label={"" as unknown as ButtonProps["label"]}
    />
  ),
  args: {
    iconName: "language" as MaterialIconName,
    label: "" as unknown as ButtonProps["label"],
  },
};

export const WithHref: Story = {
  render: (args) => (
    <Button
      {...args}
      label={"Go to link"}
      icon={args.iconName ? <MaterialIcon name={args.iconName} /> : undefined}
      href="https://example.com/"
    />
  ),
  args: {
    iconName: "language" as MaterialIconName,
  },
};

export const AsAnchor: Story = {
  render: (args) => (
    <Button {...args} as="a" href="https://example.com/" label="As anchor" />
  ),
};

export const WithoutIcon: Story = {
  args: {
    label: "Continue" satisfies ButtonProps["label"],
    iconName: undefined,
  },
};

export const IconNode: Story = {
  render: (args) => (
    <Button
      {...args}
      icon={args.iconName ? <MaterialIcon name={args.iconName} /> : undefined}
    />
  ),
  args: {
    iconName: "language" as MaterialIconName,
    label: "With icon node" satisfies ButtonProps["label"],
  },
};

export const CornersAll: Story = {
  args: {
    label: "All Corners" satisfies ButtonProps["label"],
    cornerVariant: "all",
  },
};

export const CornersTop: Story = {
  args: {
    label: "Top Corners" satisfies ButtonProps["label"],
    cornerVariant: "top",
  },
};

export const CornersBottom: Story = {
  args: {
    label: "Bottom Corners" satisfies ButtonProps["label"],
    cornerVariant: "bottom",
  },
};
