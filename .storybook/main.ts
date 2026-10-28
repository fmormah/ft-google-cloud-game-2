import type { StorybookConfig } from "@storybook/nextjs-vite";
import path from "path";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-links",
    "@storybook/addon-a11y",
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
  viteFinal: async (config) => {
    // Alias '@' to src for stories and map Origami package shorthands for Sass imports
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(process.cwd(), "src"),
      "o-header": path.resolve(
        process.cwd(),
        "node_modules/@financial-times/o-header"
      ),
      "o-footer": path.resolve(
        process.cwd(),
        "node_modules/@financial-times/o-footer"
      ),
      "o-cookie-message": path.resolve(
        process.cwd(),
        "node_modules/@financial-times/o-cookie-message"
      ),
    };

    // Add Sass include paths for Origami components
    config.css = config.css || {};
    config.css.preprocessorOptions = config.css.preprocessorOptions || {};
    config.css.preprocessorOptions.scss = {
      includePaths: [
        path.resolve(process.cwd(), "node_modules"),
        path.resolve(process.cwd(), "node_modules/@financial-times"),
      ],
      silenceDeprecations: ["import"],
    } as any;

    return config;
  },
};

export default config;
