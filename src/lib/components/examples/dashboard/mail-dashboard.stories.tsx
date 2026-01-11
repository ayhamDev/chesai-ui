import type { Meta, StoryObj } from "@storybook/react";
import { MailDashboard } from "./mail-dashboard";

const meta: Meta<typeof MailDashboard> = {
  title: "Showcase/Mail Dashboard (Gmail Style)",
  component: MailDashboard,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Full Featured Mail Dashboard

A complex, responsive dashboard template mimicking the Gmail interface.

## Key Features:
- **Split-View Layout**: Clicking a row opens a detail panel that *pushes* the table content (resizing it) rather than overlaying it.
- **Data Table Integration**: Custom cell renderers for stars, labels, and hover actions.
- **Collapsible Sidebar**: A fully functional sidebar with navigation groups.
- **Complex State**: Manages selection, read status, starred status, and routing internally.
- **Theme Support**: Fully compatible with dark mode.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MailDashboard>;

export const Default: Story = {
  render: () => <MailDashboard />,
};
