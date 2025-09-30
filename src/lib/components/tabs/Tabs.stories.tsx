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
      options: ["search", "pathname"],
    },
    routingParamName: {
      control: "text",
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
            <Typography variant="h4">Find Your Next Flight</Typography>
            <Typography variant="p">
              Search for one-way, round-trip, or multi-city flights.
            </Typography>
          </Tabs.Panel>
          <Tabs.Panel value="trips">
            <Typography variant="h4">Manage Your Trips</Typography>
            <Typography variant="p">
              View upcoming and past trip details here.
            </Typography>
          </Tabs.Panel>
          <Tabs.Panel value="explore">
            <Typography variant="h4">Explore Destinations</Typography>
            <Typography variant="p">
              Get inspired for your next adventure.
            </Typography>
          </Tabs.Panel>
        </Tabs.Content>
      </Tabs>
    </Card>
  ),
};

export const Secondary: Story = {
  name: "2. Secondary Variant (Text Only)",
  args: {
    defaultValue: "overview",
    variant: "secondary",
    pageTransition: "fade",
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
            <Typography variant="h4">Product Overview</Typography>
            <Typography variant="p">
              This is the general description of the product.
            </Typography>
          </Tabs.Panel>
          <Tabs.Panel value="specs">
            <Typography variant="h4">Technical Specifications</Typography>
            <Typography variant="p">
              Detailed technical specifications are listed here.
            </Typography>
          </Tabs.Panel>
        </Tabs.Content>
      </Tabs>
    </Card>
  ),
};

export const SwipeableCarousel: Story = {
  name: "3. Swipeable Carousel (Slide Transition)",
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

export const PathnameRouting: Story = {
  name: "4. Pathname Routing Mode",
  args: {
    ...Secondary.args,
    routingMode: "pathname",
    initialTab: "overview", // This is now the recommended way
  },
  parameters: {
    docs: {
      description: {
        story:
          "When `routingMode='pathname'`, the `initialTab` prop is used to set the URL correctly on the first render, ensuring the UI and the URL are in sync.",
      },
    },
  },
  render: (args) => <Secondary.render {...args} />,
};

export const Scrollable: Story = {
  name: "5. Scrollable Tabs",
  args: {
    ...Primary.args,
    defaultValue: "flights",
  },
  parameters: {
    docs: {
      description: {
        story:
          "When there are too many tabs to fit in the container, the list becomes horizontally scrollable with faded edges to indicate more content is available.",
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
            <Typography variant="h4">Find Your Next Flight</Typography>
          </Tabs.Panel>
          <Tabs.Panel value="trips">
            <Typography variant="h4">Manage Your Trips</Typography>
          </Tabs.Panel>
          <Tabs.Panel value="explore">
            <Typography variant="h4">Explore Destinations</Typography>
          </Tabs.Panel>
          <Tabs.Panel value="hotels">
            <Typography variant="h4">Book a Hotel</Typography>
          </Tabs.Panel>
          <Tabs.Panel value="cars">
            <Typography variant="h4">Rent a Car</Typography>
          </Tabs.Panel>
          <Tabs.Panel value="packages">
            <Typography variant="h4">Vacation Packages</Typography>
          </Tabs.Panel>
        </Tabs.Content>
      </Tabs>
    </Card>
  ),
};

export const ScrollableWithSwipe: Story = {
  name: "6. Scrollable Tabs With Swipe",
  args: {
    ...Primary.args,
    defaultValue: "flights",
    pageTransition: "slide",
  },
  parameters: {
    docs: {
      description: {
        story:
          "When there are too many tabs to fit in the container, the list becomes horizontally scrollable with faded edges to indicate more content is available.",
      },
    },
  },
  render: (args) => (
    <Card className="w-[450px]" shape="minimal">
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
            <Typography variant="h4">Find Your Next Flight</Typography>
          </Tabs.Panel>
          <Tabs.Panel value="trips">
            <Typography variant="h4">Manage Your Trips</Typography>
          </Tabs.Panel>
          <Tabs.Panel value="explore">
            <Typography variant="h4">Explore Destinations</Typography>
          </Tabs.Panel>
          <Tabs.Panel value="hotels">
            <Typography variant="h4">Book a Hotel</Typography>
          </Tabs.Panel>
          <Tabs.Panel value="cars">
            <Typography variant="h4">Rent a Car</Typography>
          </Tabs.Panel>
          <Tabs.Panel value="packages">
            <Typography variant="h4">Vacation Packages</Typography>
          </Tabs.Panel>
        </Tabs.Content>
      </Tabs>
    </Card>
  ),
};

export const WithAppBar: Story = {
  name: "7. With AppBar",
  args: {
    defaultValue: "flights",
    variant: "secondary", // Secondary variant looks better inside an AppBar
    pageTransition: "fade",
  },
  parameters: {
    layout: "fullscreen", // Override layout for this story
    docs: {
      description: {
        story:
          "This example demonstrates how to integrate the `Tabs` component with the `AppBar`. The `Tabs.List` is placed inside the `largeHeaderContent` slot of a large `AppBar`. A `ref` is created for the main scrollable container and passed to the `AppBar` via `scrollContainerRef`, allowing the AppBar to collapse and hide correctly as the user scrolls through the tab panels.",
      },
    },
  },
  render: (args) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const DummyScrollContent = ({ title }: { title: string }) => (
      <main className="p-6">
        <Typography variant="h3">{title}</Typography>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-black/5" />
          ))}
        </div>
      </main>
    );

    return (
      <div className="h-screen bg-graphite-background overflow-hidden">
        <Tabs {...args}>
          <AppBar
            size="lg"
            scrollBehavior="conditionally-sticky"
            stickyHideTarget="main-row"
            appBarColor="card"
            scrollContainerRef={scrollRef}
            startAdornment={
              <IconButton variant="ghost" size={"sm"} aria-label="Menu">
                <Menu />
              </IconButton>
            }
            endAdornments={[
              <IconButton
                key="search"
                size={"sm"}
                variant="ghost"
                aria-label="Search"
              >
                <Search />
              </IconButton>,
            ]}
            children={
              <Typography variant="h4" className="truncate font-bold">
                My App
              </Typography>
            }
            largeHeaderRowHeight={50}
            largeHeaderContent={
              // Negative margins stretch the list to the edges and counteract parent padding
              <div className="-mx-4 -mb-4">
                <Tabs.List className="!border-b-0">
                  <Tabs.Trigger value="flights">Flights</Tabs.Trigger>
                  <Tabs.Trigger value="hotels">Hotels</Tabs.Trigger>
                  <Tabs.Trigger value="cars">Cars</Tabs.Trigger>
                  <Tabs.Trigger value="packages">Packages</Tabs.Trigger>
                </Tabs.List>
              </div>
            }
          />
          <ElasticScrollArea
            ref={scrollRef}
            className="h-full overflow-y-auto pt-[100px] bg-graphite-background"
          >
            <Tabs.Content className="overflow-hidden">
              <Tabs.Panel value="flights">
                <DummyScrollContent title="Search for Flights" />
              </Tabs.Panel>
              <Tabs.Panel value="hotels">
                <DummyScrollContent title="Find Hotel Deals" />
              </Tabs.Panel>
              <Tabs.Panel value="cars">
                <DummyScrollContent title="Rent a Car" />
              </Tabs.Panel>
              <Tabs.Panel value="packages">
                <DummyScrollContent title="Vacation Packages" />
              </Tabs.Panel>
            </Tabs.Content>
          </ElasticScrollArea>
        </Tabs>
      </div>
    );
  },
};
