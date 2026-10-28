import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import MaterialIcon, {
  type MaterialIconName,
  type MaterialIconProps,
} from "./index";

const ICON_NAMES: MaterialIconName[] = [
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
  "arrow_drop_down",
  "arrow_drop_up",
];

const meta: Meta<typeof MaterialIcon> = {
  title: "Atoms/Icon",
  component: MaterialIcon,
  tags: ["autodocs"],
  args: {
    name: "frame_person" satisfies MaterialIconProps["name"],
    fill: 0,
    weight: 100,
    grade: 0,
    opticalSize: 24,
  },
  argTypes: {
    name: { control: { type: "select" }, options: ICON_NAMES },
    fill: { control: { type: "inline-radio" }, options: [0, 1] },
    weight: {
      control: { type: "select" },
      options: [100, 200, 300, 400, 500, 600, 700],
    },
    grade: { control: { type: "select" }, options: [-50, 0, 200] },
    opticalSize: { control: { type: "select" }, options: [20, 24, 40, 48] },
    sizePx: { control: { type: "number" } },
  },
};

export default meta;

type Story = StoryObj<typeof MaterialIcon>;

export const Playground: Story = {
  args: {
    name: "frame_person",
  },
};

export const AllIcons: Story = {
  render: (args) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 16,
      }}
    >
      {ICON_NAMES.map((name) => (
        <div
          key={name}
          style={{ display: "flex", alignItems: "center", gap: 12 }}
        >
          <MaterialIcon {...args} name={name} />
          <code style={{ fontSize: 12 }}>{name}</code>
        </div>
      ))}
    </div>
  ),
  args: {
    fill: 0,
    weight: 100,
    grade: 0,
    opticalSize: 24,
  },
};
