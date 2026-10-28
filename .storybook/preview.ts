import type { Preview } from "@storybook/react";
// Import Origami styles directly to avoid Sass includePath issues in Storybook
import "@/theme/origami-setup.scss";
import "../src/theme/global.scss";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "black",
      values: [
        { name: "black", value: "#000000" },
        { name: "dark", value: "#0c2431" },
        { name: "light", value: "#ffffff" },
      ],
    },
  },
};

export default preview;
