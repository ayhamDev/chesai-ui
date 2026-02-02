import type { Preview } from "@storybook/react-vite";
import { themes } from "@storybook/theming";
import "../src/lib/tailwind/theme.css";
import "../src/lib/tailwind/typography.css";
import { LayoutProvider } from "../src/lib/context/layout-context";
const preview: Preview = {
  parameters: {
    darkMode: {
      // Add the class names you defined in your CSS
      classTarget: "html",
      darkClass: "dark",
      lightClass: "light",
      // Set the default theme for Storybook
      current: "light",
      stylePreview: true,
      // Optional: You can customize the Storybook UI theme as well
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
