import type { Preview } from "@storybook/react-vite";
import { themes } from "@storybook/theming";
import "react-medium-image-zoom/dist/styles.css";
import { LayoutProvider } from "../src/lib/context/layout-context";
import "../src/lib/tailwind/theme.css";
import "../src/lib/tailwind/typography.css";
import "../src/lib/components/medium-text-editor/editor-styles.css";

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ["Website Studio", "*"], // Forces Website Studio to be the first category
      },
    },
    darkMode: {
      classTarget: "html",
      darkClass: "dark",
      lightClass: "light",
      current: "light",
      stylePreview: true,
      dark: { ...themes.dark, appBg: "#121212" },
      light: { ...themes.dark, appBg: "#121212" },
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => {
      return (
        <LayoutProvider>
          <Story />
        </LayoutProvider>
      );
    },
  ],
};

export default preview;
