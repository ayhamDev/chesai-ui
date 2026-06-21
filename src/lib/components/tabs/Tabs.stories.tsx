import type { Meta, StoryObj } from "@storybook/react";
import {
  Car,
  Compass,
  Hotel,
  LocateIcon,
  Menu,
  Package,
  Plane,
  Search,
} from "lucide-react";
import { useRef } from "react";
import { AppBar } from "../appbar";
import { Card } from "../card";
import { IconButton } from "../icon-button";
import { Typography } from "../typography";
import { Tabs } from "./index";
import { ElasticScrollArea } from "../elastic-scroll-area/index";

const meta: Meta<typeof Tabs> = {
  title: "Components/Navigators/Tabs",
  component: Tabs,
  subcomponents: {
    "Tabs.List": Tabs.List,
    "Tabs.Trigger": Tabs.Trigger,
    "Tabs.Content": Tabs.Content,
    "Tabs.Panel": Tabs.Panel,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A fully-featured tabs component with animated indicators and page transitions. It integrates with the `ShallowRouter` to support browser history and deep linking.",
      },
    },
  },
  argTypes: {
    defaultValue: {
      control: "text",
      description: "The value of the tab to be active on initial render.",
    },
    initialTab: {
      control: "text",
      description: "Sets the initial route for 'pathname' mode on first load.",
      if: { arg: "routingMode", eq: "pathname" },
    },
    variant: {
      control: "select",
      options: ["primary", "secondary"],
    },
    pageTransition: {
      control: "select",
      options: ["slide", "fade"],
    },
    routingMode: {
      control: "select",
      options: ["search", "pathname", "memory"],
    },
    routingParamName: {
      control: "text",
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description:
        "Applies layout container shape standards from MD3 design system.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Standard layout density controls.",
    },
    stretch: {
      control: "boolean",
      description:
        "Whether trigger elements stretch to occupy 100% equal width of the list container.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Primary: Story = {
  name: "1. Primary Variant (with Icons)",
  args: {
    defaultValue: "flights",
    variant: "primary",
    pageTransition: "fade",
    routingParamName: "view",
    stretch: true,
    shape: "minimal",
    size: "md",
  },
  render: (args) => (
    <Card className="w-96" shape="minimal">
      <Tabs {...args}>
        <Tabs.List>
          <Tabs.Trigger value="flights" icon={<Plane size={20} />}>
            Flights
          </Tabs.Trigger>
          <Tabs.Trigger value="trips" icon={<LocateIcon size={20} />}>
            Trips
          </Tabs.Trigger>
          <Tabs.Trigger value="explore" icon={<Compass size={20} />}>
            Explore
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content>
          <Tabs.Panel value="flights">
            <Typography variant="title-small">Find Your Next Flight</Typography>
            <Typography variant="body-medium">
              Search for one-way, round-trip, or multi-city flights.
            </Typography>
          </Tabs.Panel>
          <Tabs.Panel value="trips">
            <Typography variant="title-small">Manage Your Trips</Typography>
            <Typography variant="body-medium">
              View upcoming and past trip details here.
            </Typography>
          </Tabs.Panel>
          <Tabs.Panel value="explore">
            <Typography variant="title-small">Explore Destinations</Typography>
            <Typography variant="body-medium">
              Get inspired for your next adventure.
            </Typography>
          </Tabs.Panel>
        </Tabs.Content>
      </Tabs>
    </Card>
  ),
};

export const AutoWidthStartIcon: Story = {
  name: "2. Content Width (Icon Beside Text)",
  args: {
    defaultValue: "categories",
    variant: "secondary",
    stretch: false,
    shape: "minimal",
    size: "md",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Setting `stretch={false}` allows the tabs to fit exactly to their contents. You can also override the `iconPosition` on individual triggers to place the icon on the side.",
      },
    },
  },
  render: (args) => (
    <Card className="w-[500px]" shape="minimal">
      <Tabs {...args}>
        <Tabs.List className="gap-2">
          <Tabs.Trigger
            value="categories"
            icon={<Package size={16} />}
            iconPosition="start"
          >
            Categories & Items
          </Tabs.Trigger>
          <Tabs.Trigger
            value="modifiers"
            icon={<Menu size={16} />}
            iconPosition="start"
          >
            Modifier Groups
          </Tabs.Trigger>
          <Tabs.Trigger
            value="dietary"
            icon={<LocateIcon size={16} />}
            iconPosition="start"
          >
            Dietary Tags
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content>
          <Tabs.Panel value="categories">
            <Typography variant="title-small">
              Categories & Items Settings
            </Typography>
          </Tabs.Panel>
          <Tabs.Panel value="modifiers">
            <Typography variant="title-small">
              Modifier Groups Configuration
            </Typography>
          </Tabs.Panel>
          <Tabs.Panel value="dietary">
            <Typography variant="title-small">
              Dietary Tags Management
            </Typography>
          </Tabs.Panel>
        </Tabs.Content>
      </Tabs>
    </Card>
  ),
};

export const AllShapesAndSizes: Story = {
  name: "3. Shapes and Sizing variations",
  args: {
    defaultValue: "tab1",
    stretch: false,
  },
  render: (args) => (
    <div className="flex flex-col gap-6 w-[550px]">
      <div>
        <Typography variant="label-small" className="mb-2 block opacity-60">
          Small Size + Full Shape
        </Typography>
        <Card shape="minimal" padding="sm">
          <Tabs {...args} size="sm" shape="full">
            <Tabs.List className="gap-1 border-none">
              <Tabs.Trigger value="tab1">Small Tab 1</Tabs.Trigger>
              <Tabs.Trigger value="tab2">Small Tab 2</Tabs.Trigger>
              <Tabs.Trigger value="tab3">Small Tab 3</Tabs.Trigger>
            </Tabs.List>
          </Tabs>
        </Card>
      </div>

      <div>
        <Typography variant="label-small" className="mb-2 block opacity-60">
          Large Size + Sharp Shape
        </Typography>
        <Card shape="sharp" padding="none">
          <Tabs {...args} size="lg" shape="sharp">
            <Tabs.List className="border-b-0">
              <Tabs.Trigger value="tab1" className="flex-1">
                Large Tab 1
              </Tabs.Trigger>
              <Tabs.Trigger value="tab2" className="flex-1">
                Large Tab 2
              </Tabs.Trigger>
              <Tabs.Trigger value="tab3" className="flex-1">
                Large Tab 3
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs>
        </Card>
      </div>
    </div>
  ),
};

export const Secondary: Story = {
  name: "4. Secondary Variant (Text Only)",
  args: {
    defaultValue: "overview",
    variant: "secondary",
    pageTransition: "fade",
    stretch: true,
  },
  render: (args) => (
    <Card className="w-96" shape="minimal">
      <Tabs {...args}>
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="specs">Specifications</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content>
          <Tabs.Panel value="overview">
            <Typography variant="title-small">Product Overview</Typography>
            <Typography variant="body-medium">
              This is the general description of the product.
            </Typography>
          </Tabs.Panel>
          <Tabs.Panel value="specs">
            <Typography variant="title-small">
              Technical Specifications
            </Typography>
            <Typography variant="body-medium">
              Detailed technical specifications are listed here.
            </Typography>
          </Tabs.Panel>
        </Tabs.Content>
      </Tabs>
    </Card>
  ),
};

export const SwipeableCarousel: Story = {
  name: "5. Swipeable Carousel (Slide Transition)",
  args: {
    ...Primary.args,
    pageTransition: "slide",
  },
  parameters: {
    docs: {
      description: {
        story:
          'Set `pageTransition="slide"` to create a carousel effect. You can now drag with a mouse or swipe on a touch screen to navigate between panels.',
      },
    },
  },
  render: (args) => <Primary.render {...args} />,
};

export const Scrollable: Story = {
  name: "6. Scrollable Tabs",
  args: {
    ...Primary.args,
    defaultValue: "flights",
    stretch: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "When there are too many tabs to fit in the container, setting `stretch={false}` allows the list to be horizontally scrollable with faded edges.",
      },
    },
  },
  render: (args) => (
    <Card className="w-80" shape="minimal">
      <Tabs {...args}>
        <Tabs.List>
          <Tabs.Trigger value="flights" icon={<Plane size={20} />}>
            Flights
          </Tabs.Trigger>
          <Tabs.Trigger value="trips" icon={<LocateIcon size={20} />}>
            Trips
          </Tabs.Trigger>
          <Tabs.Trigger value="explore" icon={<Compass size={20} />}>
            Explore
          </Tabs.Trigger>
          <Tabs.Trigger value="hotels" icon={<Hotel size={20} />}>
            Hotels
          </Tabs.Trigger>
          <Tabs.Trigger value="cars" icon={<Car size={20} />}>
            Car Rentals
          </Tabs.Trigger>
          <Tabs.Trigger value="packages" icon={<Package size={20} />}>
            Packages
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content>
          <Tabs.Panel value="flights">
            <Typography variant="title-small">Find Your Next Flight</Typography>
          </Tabs.Panel>
          <Tabs.Panel value="trips">
            <Typography variant="title-small">Manage Your Trips</Typography>
          </Tabs.Panel>
          <Tabs.Panel value="explore">
            <Typography variant="title-small">Explore Destinations</Typography>
          </Tabs.Panel>
          <Tabs.Panel value="hotels">
            <Typography variant="title-small">Book a Hotel</Typography>
          </Tabs.Panel>
          <Tabs.Panel value="cars">
            <Typography variant="title-small">Rent a Car</Typography>
          </Tabs.Panel>
          <Tabs.Panel value="packages">
            <Typography variant="title-small">Vacation Packages</Typography>
          </Tabs.Panel>
        </Tabs.Content>
      </Tabs>
    </Card>
  ),
};
