import type { Meta, StoryObj } from "@storybook/react";
import {
  ArrowLeft,
  Menu,
  MoreVertical,
  Paperclip,
  Search,
  User,
} from "lucide-react";
import { IconButton } from "../icon-button"; // Assuming these are in your project
import { Typography } from "../typography"; // Assuming these are in your project
import { AppBar } from "./index";

const meta: Meta<typeof AppBar> = {
  title: "Components/AppBar",
  component: AppBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A versatile AppBar that can be sticky, hide on scroll, and expand to a large, collapsible header. It dynamically measures its own height from the DOM to ensure animations are always accurate.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["md", "lg"],
      description: "Controls the size and collapsing behavior of the AppBar.",
    },
    appBarColor: {
      control: "select",
      options: ["background", "card", "primary", "secondary"],
    },
    scrollBehavior: {
      control: "select",
      options: ["sticky", "conditionally-sticky"],
    },
    // Updated control to 'check' for multi-select
    animatedBehavior: {
      control: "check",
      options: ["appbar-color", "fold"],
    },
    animatedColor: {
      control: "select",
      options: ["background", "card", "primary", "secondary"],
    },
    stickyHideTarget: {
      control: "select",
      options: [undefined, "main-row", "full-appbar"],
      description:
        "Overrides the default behavior for `conditionally-sticky`. Forces the hiding behavior to target either the main row or the full app bar height.",
    },
    children: { control: false },
    largeHeaderContent: { control: false },
    smallHeaderContent: { control: false },
    startAdornment: { control: false },
    centerAdornment: { control: false },
    endAdornments: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof AppBar>;

// Helper component to generate scrollable content
const DummyContent = () => (
  <main className="p-6 pt-4">
    <Typography variant="h3">Scroll Down to See The Effect</Typography>
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="h-48 rounded-2xl bg-black/5" />
      ))}
    </div>
  </main>
);

// A smart render function to wrap stories and handle padding
const render = (args: any) => {
  let paddingTop = "pt-[64px]"; // Default for 'md'
  if (args.size === "lg" && args.largeHeaderContent) {
    paddingTop = "pt-[160px]";
  }
  if (args.className?.includes("h-20")) {
    paddingTop = "pt-20";
  }

  return (
    <AppBar.Provider mainContentColor="background">
      <AppBar {...args} />
      <div className={paddingTop}>
        <DummyContent />
      </div>
    </AppBar.Provider>
  );
};

// --- STORIES ---

export const Default: Story = {
  name: "Default (Medium, Sticky)",
  args: {
    size: "md",
    scrollBehavior: "sticky",
    appBarColor: "card",
    children: <Typography variant="h4">Sticky Header</Typography>,
    startAdornment: (
      <IconButton variant="ghost" aria-label="Menu">
        <Menu />
      </IconButton>
    ),
    endAdornments: [
      <IconButton key="user-profile" variant="ghost" aria-label="User Profile">
        <User />
      </IconButton>,
    ],
  },
  render,
};

export const ConditionallySticky: Story = {
  name: "Medium, Hiding on Scroll",
  args: {
    ...Default.args,
    scrollBehavior: "conditionally-sticky",
    children: <Typography variant="h4">Hiding Header</Typography>,
  },
  render,
  parameters: {
    docs: {
      description: {
        story:
          "With `scrollBehavior` set to `conditionally-sticky`, the AppBar scrolls out of view when scrolling down and reappears when scrolling up.",
      },
    },
  },
};

export const AnimatedColor: Story = {
  name: "Medium, Animated Color",
  args: {
    ...Default.args,
    animatedBehavior: ["appbar-color"], // Now an array
    appBarColor: "background",
    animatedColor: "card",
    children: <Typography variant="h4">Animated Header</Typography>,
  },
  render,
  parameters: {
    docs: {
      description: {
        story:
          "With `animatedBehavior` including `appbar-color`, the AppBar transitions to the `animatedColor` when the user scrolls.",
      },
    },
  },
};

// New story for the folding effect
export const FoldingOnScroll: Story = {
  name: "Medium, Folding on Scroll",
  args: {
    ...Default.args,
    animatedBehavior: ["fold"], // Enable the fold effect
    children: <Typography variant="h4">Folding Header</Typography>,
  },
  render,
  parameters: {
    docs: {
      description: {
        story:
          "With `animatedBehavior` including `fold`, the AppBar's bottom corners become rounded as you scroll down, creating a neat 'folding' effect.",
      },
    },
  },
};

export const LargeCollapsing: Story = {
  name: "Large, Fully Collapsible",
  args: {
    size: "lg",
    scrollBehavior: "conditionally-sticky",
    appBarColor: "card",
    startAdornment: (
      <IconButton variant="ghost" aria-label="Back">
        <ArrowLeft />
      </IconButton>
    ),
    endAdornments: [
      <IconButton key="attach" variant="ghost" aria-label="Attach">
        <Paperclip />
      </IconButton>,
      <IconButton key="more" variant="ghost" aria-label="More">
        <MoreVertical />
      </IconButton>,
    ],
    children: (
      <Typography variant="h2" className="truncate font-bold">
        Large Collapsing Title
      </Typography>
    ),
    smallHeaderContent: (
      <Typography variant="h4" className="font-semibold">
        Collapsed Title
      </Typography>
    ),
    largeHeaderContent: (
      <div className="flex items-center gap-2 rounded-full bg-black/5 px-4 py-2">
        <Search className="h-5 w-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-transparent outline-none"
        />
      </div>
    ),
  },
  render,
  parameters: {
    docs: {
      description: {
        story:
          "**This is the primary `lg` use case.** When `size` is `lg` and *both* `largeHeaderContent` and `smallHeaderContent` are provided, the AppBar becomes fully collapsible. On scroll, it smoothly animates its height, fades out the large content, and cross-fades the titles. The `conditionally-sticky` behavior engages *after* the header has fully collapsed, hiding the remaining small header.",
      },
    },
  },
};

// ... (LargeStatic and LargeStaticWithOverride stories remain unchanged) ...
export const LargeStatic: Story = {
  name: "Large, Static (No Collapse)",
  args: {
    ...LargeCollapsing.args,
    smallHeaderContent: undefined,
    children: (
      <Typography variant="h2" className="truncate font-bold">
        Large Static Title
      </Typography>
    ),
  },
  render,
  parameters: {
    docs: {
      description: {
        story:
          "**This demonstrates the smart default behavior.** When `size` is `lg` but `smallHeaderContent` is omitted, the AppBar **does not collapse**. It remains in its large, expanded state. The `conditionally-sticky` behavior adapts and now hides the *entire visible AppBar* on scroll, since there is no smaller state to transition to.",
      },
    },
  },
};

export const LargeStaticWithOverride: Story = {
  name: "Large, Static with Hide Override",
  args: {
    ...LargeStatic.args,
    stickyHideTarget: "main-row",
  },
  render,
  parameters: {
    docs: {
      description: {
        story:
          "This builds on the 'Large, Static' story. Even though the AppBar is not collapsible, we can use the `stickyHideTarget='main-row'` prop to force the `conditionally-sticky` behavior to hide *only the main title row*, leaving the `largeHeaderContent` (the search bar) visible at the top.",
      },
    },
  },
};

export const CombinedEffects: Story = {
  name: "Kitchen Sink (All Effects)",
  args: {
    ...LargeCollapsing.args,
    // Enable both effects
    animatedBehavior: ["appbar-color", "fold"],

    animatedColor: "secondary",
  },
  render,
  parameters: {
    docs: {
      description: {
        story:
          "A demonstration of all features working in harmony. This `lg` AppBar collapses, hides on scroll, animates its color, and folds its corners simultaneously.",
      },
    },
  },
};
