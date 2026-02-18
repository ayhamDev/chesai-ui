import type { Meta, StoryObj } from "@storybook/react";
import { Carousel, CarouselItem } from "./index";
import { Typography } from "../typography";

// --- MOCK DATA ---
const ITEMS = [
  {
    id: 1,
    title: "Midnight Dunes",
    subtitle: "Sahara Desert",
    image:
      "https://images.unsplash.com/photo-1547234935-80c7142ee969?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Northern Lights",
    subtitle: "Iceland",
    image:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Urban Jungle",
    subtitle: "Tokyo, Japan",
    image:
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Misty Mountains",
    subtitle: "Pacific Northwest",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Coastal Calm",
    subtitle: "Amalfi Coast",
    image:
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Deep Space",
    subtitle: "Nebula",
    image:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000&auto=format&fit=crop",
  },
];

const meta: Meta<typeof Carousel> = {
  title: "Components/Media/Material3 Carousel",
  component: Carousel,
  subcomponents: { CarouselItem: CarouselItem as any }, // Cast to any to avoid TS strictness on generic components in Storybook
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A physics-based carousel inspired by Material Design 3. It features 'active-item expansion' where the centered item grows in width while side items shrink. Supports dragging, flicking, infinite looping, and responsive breakpoints.",
      },
    },
  },
  argTypes: {
    slidesPerView: {
      control: { type: "range", min: 1, max: 5, step: 1 },
      description: "How many slides to show in the viewport at once.",
    },
    loop: {
      control: "boolean",
      description: "Enables infinite scrolling.",
    },
    autoplay: {
      control: "boolean",
      description: "Enables automatic sliding.",
    },
    height: {
      control: "text",
      description: "CSS height of the carousel container.",
    },
  },
  // Add a dark background wrapper to make the images pop
  decorators: [
    (Story) => (
      <div className="w-full bg-graphite-background py-12 flex flex-col justify-center min-h-[600px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Carousel>;

// --- TEMPLATE ---
const CarouselTemplate = (args: any) => (
  <div className="w-full">
    <div className="px-8 mb-6">
      <Typography variant="title-medium" className="font-bold">
        Explore Locations
      </Typography>
      <Typography variant="body-small" muted={true}>
        Swipe to see more destinations.
      </Typography>
    </div>
    <Carousel {...args}>
      {ITEMS.map((item, index) => (
        <CarouselItem
          key={item.id}
          index={index} // Index is required for the animation logic
          imageUrl={item.image}
          title={item.title}
          subtitle={item.subtitle}
          onClick={() => console.log(`Clicked ${item.title}`)}
        />
      ))}
    </Carousel>
  </div>
);

// --- STORIES ---

export const Default: Story = {
  name: "1. Default Behavior",
  args: {
    slidesPerView: 3,
    height: "450px",
    loop: false,
    autoplay: true,
  },
  render: CarouselTemplate,
};

export const InfiniteLoop: Story = {
  name: "2. Infinite Loop & Autoplay",
  args: {
    slidesPerView: 5,
    height: "450px",
    loop: true,
    autoplay: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Sets `loop={true}` to seamlessly teleport items from end to start. `autoplay={true}` automatically advances the slides every 3 seconds (pauses on hover).",
      },
    },
  },
  render: CarouselTemplate,
};

export const HeroSlider: Story = {
  name: "3. Hero Slider (1 Slide)",
  args: {
    slidesPerView: 1,
    height: "600px",
    loop: true,
    autoplay: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Setting `slidesPerView={1}` creates a classic full-width hero slider experience while retaining the swiping physics.",
      },
    },
  },
  render: CarouselTemplate,
};

export const Responsive: Story = {
  name: "4. Responsive Breakpoints",
  args: {
    height: "400px",
    loop: false,
    // Start small
    slidesPerView: 1,
    // Define breakpoints
    breakpoints: {
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
      1400: { slidesPerView: 4 },
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Resize the window to see the number of slides change dynamically. \n\nLogic: \n- < 640px: **1** slide \n- 640px+: **2** slides \n- 1024px+: **3** slides \n- 1400px+: **4** slides",
      },
    },
  },
  render: CarouselTemplate,
};

export const DensePacked: Story = {
  name: "5. Dense Packed (5 Slides)",
  args: {
    slidesPerView: 5,
    height: "350px",
    loop: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Useful for film strips or gallery views. The active item still expands to take up ~45% of the space, compressing the neighbors.",
      },
    },
  },
  render: CarouselTemplate,
};

export const CompactMobile: Story = {
  name: "6. Compact Mobile View",
  args: {
    slidesPerView: 4, // Fractional values allow peeking at the next slide
    height: "300px",
    loop: false,
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "Using a fractional `slidesPerView` (e.g., 1.2) creates a 'peeking' effect, encouraging users to swipe.",
      },
    },
  },
  render: CarouselTemplate,
};
