import type { Meta, StoryObj } from "@storybook/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Button } from "../button";
import { Typography } from "../typography";
import { Sheet } from "./index"; // Assuming your component file is named index.tsx

const meta: Meta<typeof Sheet> = {
  title: "Components/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A versatile and responsive sheet component. It renders as a bottom sheet on mobile viewports and intelligently transitions to a side sheet (drawer) on desktop. This behavior can be overridden.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "card"],
      description: "The color variant of the sheet.",
    },
    side: {
      control: "select",
      options: ["left", "right", "top", "bottom"],
      description:
        "Determines which side the sheet appears from on desktop viewports.",
    },
    mode: {
      control: "select",
      options: ["normal", "detached"],
      description:
        "Controls the visual style ('normal' vs. floating 'detached').",
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      description: "Controls the border-radius of the sheet.",
    },
    forceBottomSheet: {
      control: "boolean",
      description:
        "If true, forces the component to render as a bottom sheet on all screen sizes.",
    },
    forceSideSheet: {
      control: "boolean",
      description:
        "If true, forces the component to render as a side sheet on all screen sizes.",
    },
    // Vaul-specific props
    snapPoints: {
      control: "object",
      description: "Array of snap points for the bottom sheet mode.",
    },
    fadeFromIndex: {
      control: "number",
      description:
        "Required when snapPoints are used. Snap points are disabled on desktop.",
    },
    dismissible: {
      control: "boolean",
    },
    // We don't control these directly but show their action
    activeSnapPoint: { control: false },
    setActiveSnapPoint: { action: "snapPointChanged" },
  },
};

export default meta;
type Story = StoryObj<typeof Sheet>;

// Helper for rich, scrollable content
const DummyContent = () => (
  <div className="flex-1 overflow-y-auto p-6">
    <Typography variant="h4" className="mb-2">
      Sheet Content
    </Typography>
    <Typography variant="p">
      This is the main content area. If the content becomes too long, this area
      will automatically become scrollable.
    </Typography>
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={`dummy-item-${i}`} className="h-24 rounded-2xl bg-black/5" />
      ))}
    </div>
  </div>
);

// --- STORIES ---

export const ResponsiveBehavior: Story = {
  name: "1. Responsive Behavior (Default)",
  args: {
    side: "right",
    mode: "normal",
    shape: "full",
  },
  parameters: {
    docs: {
      description: {
        story:
          "**This is the primary use case.** By default, the component is a **bottom sheet** on mobile and a **side sheet** on desktop. Resize your browser window to see the transition.",
      },
    },
  },
  render: (args) => (
    <div className="flex h-[500px] w-full items-center justify-center bg-graphite-background p-12">
      <Sheet {...args}>
        <Sheet.Trigger asChild>
          <Button>Open Sheet</Button>
        </Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Grabber />
          <Sheet.Header>
            <Sheet.Title>
              <Typography variant="h3">Responsive Sheet</Typography>
            </Sheet.Title>
            <Sheet.Description>
              <Typography variant="muted">
                Adapts to your screen size.
              </Typography>
            </Sheet.Description>
          </Sheet.Header>
          <DummyContent />
          <Sheet.Footer>
            <Button size="lg">Save Changes</Button>
            <Sheet.Close asChild>
              <Button size="lg" variant="secondary">
                Close
              </Button>
            </Sheet.Close>
          </Sheet.Footer>
        </Sheet.Content>
      </Sheet>
    </div>
  ),
};

export const ForceBottomSheet: Story = {
  name: "2. Force Bottom Sheet on Desktop",
  args: {
    ...ResponsiveBehavior.args,
    forceBottomSheet: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Set `forceBottomSheet={true}` to override the responsive behavior and always render a bottom sheet, even on large screens.",
      },
    },
  },
  render: (args) => <ResponsiveBehavior.render {...args} />,
};

export const ForceSideSheet: Story = {
  name: "3. Force Side Sheet on Mobile",
  args: {
    ...ResponsiveBehavior.args,
    forceSideSheet: true,
    side: "left",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Set `forceSideSheet={true}` to override the responsive behavior and always render a side sheet, even on small screens. This is useful for main navigation drawers that need to be consistent across all devices.",
      },
    },
    // Set a mobile viewport to demonstrate the override
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  render: (args) => <ResponsiveBehavior.render {...args} />,
};

export const ColorVariants: Story = {
  name: "4. Color Variants",
  args: {
    side: "right",
    forceSideSheet: true, // Force side sheet to better see colors on desktop
  },
  render: (args) => (
    <div className="flex h-[500px] w-full items-center justify-center gap-4 bg-graphite-background p-12">
      {/* Card Variant */}
      <Sheet {...args} variant="card">
        <Sheet.Trigger asChild>
          <Button>Card (Default)</Button>
        </Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Header>
            <Sheet.Title>
              <Typography variant="h3">Card Variant</Typography>
            </Sheet.Title>
          </Sheet.Header>
          <DummyContent />
        </Sheet.Content>
      </Sheet>
      {/* Secondary Variant */}
      <Sheet {...args} variant="secondary">
        <Sheet.Trigger asChild>
          <Button>Secondary</Button>
        </Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Header>
            <Sheet.Title>
              <Typography variant="h3">Secondary Variant</Typography>
            </Sheet.Title>
          </Sheet.Header>
          <DummyContent />
        </Sheet.Content>
      </Sheet>
      {/* Primary Variant */}
      <Sheet {...args} variant="primary">
        <Sheet.Trigger asChild>
          <Button>Primary</Button>
        </Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Header>
            <Sheet.Title>
              <Typography variant="h3">Primary Variant</Typography>
            </Sheet.Title>
          </Sheet.Header>
          <DummyContent />
        </Sheet.Content>
      </Sheet>
    </div>
  ),
};

export const SideSheetLeft: Story = {
  name: "5. Side Sheet (Left)",
  args: {
    ...ResponsiveBehavior.args,
    side: "left",
    forceSideSheet: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use the `side` prop to control the drawer's position on desktop.",
      },
    },
  },
  render: (args) => <ResponsiveBehavior.render {...args} />,
};

export const DetachedMode: Story = {
  name: "6. Detached Mode",
  args: {
    ...ResponsiveBehavior.args,
    mode: "detached",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The `detached` mode adds a margin, making the sheet appear to float. This works responsively for both bottom and side sheet variants.",
      },
    },
  },
  render: (args) => <ResponsiveBehavior.render {...args} />,
};

export const WithSnappingPoints: Story = {
  name: "7. With Snapping Points",
  args: {
    snapPoints: [0.3, 0.7, 1],
    fadeFromIndex: 0,
    forceBottomSheet: true, // Snapping is a bottom sheet feature
  },
  parameters: {
    docs: {
      description: {
        story:
          "**Snapping only works in bottom sheet mode.** If the component renders as a side sheet on desktop, snap points are automatically disabled. Here, we use `forceBottomSheet` to demonstrate them on a large screen.",
      },
    },
  },
  render: (args) => (
    <div className="flex h-[500px] w-full items-center justify-center bg-graphite-background p-12">
      <Sheet {...args}>
        <Sheet.Trigger asChild>
          <Button>Open Snapping Sheet</Button>
        </Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Grabber />
          <DummyContent />
        </Sheet.Content>
      </Sheet>
    </div>
  ),
};

export const ControlledSnapping: Story = {
  name: "8. Controlled Snapping",
  args: {
    snapPoints: ["300px", 1],
    fadeFromIndex: 0,
    forceBottomSheet: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Manually control the snap point from outside the component using the `activeSnapPoint` and `setActiveSnapPoint` props. This only works in bottom sheet mode.",
      },
    },
  },
  render: function Render(args) {
    const [activeSnapPoint, setActiveSnapPoint] = useState<
      string | number | null
    >(args.snapPoints![0]);
    return (
      <div className="flex h-[500px] w-full flex-col items-center justify-center gap-4 bg-graphite-background p-12">
        <Typography variant="large">External Controls</Typography>

        <Sheet
          {...args}
          activeSnapPoint={activeSnapPoint}
          setActiveSnapPoint={setActiveSnapPoint}
        >
          <Sheet.Trigger asChild>
            <Button>Open Controlled Sheet</Button>
          </Sheet.Trigger>
          <Sheet.Content>
            <Sheet.Grabber />
            <Sheet.Header>
              <Typography variant="h3">
                Current Snap: {String(activeSnapPoint)}
              </Typography>
            </Sheet.Header>

            <div
              className={clsx(
                activeSnapPoint === 1 ? "overflow-auto" : "overflow-hidden",
                "p-4",
              )}
            >
              <Typography>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Explicabo, eligendi! Voluptates nobis nam animi similique vero
                tenetur sunt velit? Maxime numquam neque ducimus recusandae quae
                non laudantium eum officiis nostrum. Cupiditate veritatis facere
                reiciendis cum fuga iste, ab qui animi culpa ducimus sed
                molestias? Qui, facilis alias? Ipsum sunt corrupti mollitia
                libero a quibusdam, rerum dignissimos, quam magni id unde.
                Quaerat, modi suscipit odio laboriosam alias, eum recusandae
                quod, aut nobis quidem explicabo impedit optio possimus amet ea.
                Non odio, placeat vel officia iusto vitae accusamus velit sint
                quo facere. Est et eius, esse culpa inventore sequi eum soluta
                perspiciatis illo minima, facilis nobis sed numquam similique.
                Soluta, ipsa eum enim amet dolorum error nemo at ab. Sit,
                repudiandae autem. Reiciendis quo eveniet molestias dolore
                exercitationem? Tenetur deleniti magni facere! Ducimus explicabo
                alias deleniti perferendis delectus accusamus deserunt tenetur
                iste dolor ullam, odio aliquid autem aut illum ad officiis
                vitae. Ipsam repellat neque ab debitis accusantium cupiditate
                laudantium, rem perferendis mollitia repudiandae architecto
                voluptatibus laborum et eius nemo iste harum nisi unde
                asperiores tempora placeat officia esse quia. Vitae, odit? Ipsa,
                similique rem. Minus eveniet totam quidem quia asperiores
                nostrum cupiditate corporis error expedita. Consequatur
                aspernatur, sint eum corporis, nisi earum dicta sed quae
                molestias sunt ipsa ex magni porro. Distinctio animi facilis
                doloremque beatae libero laudantium ducimus aliquam molestias,
                voluptates amet fugiat facere perferendis deserunt harum dicta
                eveniet quis sed deleniti repellendus veniam ullam reiciendis?
                Accusantium reprehenderit laudantium nemo. Quod nemo omnis hic
                optio laudantium saepe magni veniam excepturi, tenetur alias
                eveniet quibusdam, quidem recusandae quasi? Ipsum error
                accusamus corporis. Cum nesciunt ab repellat vitae consequatur
                et qui nemo. Magnam deserunt libero cumque magni ea pariatur,
                iusto consectetur, natus, ducimus sunt eum! Quisquam aliquid
                fugit suscipit architecto sunt quas at optio neque porro
                expedita, placeat dolor perferendis sequi tempora?
              </Typography>
            </div>
          </Sheet.Content>
        </Sheet>
      </div>
    );
  },
};

export const AlwaysActive: Story = {
  name: "9. AlwaysActive (Non Modal)",
  args: {
    snapPoints: ["300px", 1],
    dismissible: false,
    forceBottomSheet: true,
    variant: "secondary",
    fadeFromIndex: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Manually control the snap point from outside the component using the `activeSnapPoint` and `setActiveSnapPoint` props. This only works in bottom sheet mode.",
      },
    },
  },

  render: function Render(args) {
    const [activeSnapPoint, setActiveSnapPoint] = useState<
      string | number | null
    >(args.snapPoints![0]);
    const [IsModal, setIsModal] = useState(false);
    useEffect(() => {
      setIsModal(activeSnapPoint === 1 ? true : false);
    }, [activeSnapPoint]);
    return (
      <div className="flex h-[500px] w-full flex-col items-center justify-center gap-4 bg-graphite-background p-12">
        <Button>Clickable Even When Sheet Is Open</Button>
        <Sheet
          {...args}
          open={true}
          modal={false}
          activeSnapPoint={activeSnapPoint}
          setActiveSnapPoint={setActiveSnapPoint}
        >
          <Sheet.Content>
            <Sheet.Grabber />
            <Sheet.Header>
              <Typography variant="h3">
                Current Snap: {String(activeSnapPoint)}
              </Typography>
            </Sheet.Header>

            <div
              className={clsx(
                activeSnapPoint === 1 ? "overflow-auto" : "overflow-hidden",
                "p-4",
              )}
            >
              <Typography>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Explicabo, eligendi! Voluptates nobis nam animi similique vero
                tenetur sunt velit? Maxime numquam neque ducimus recusandae quae
                non laudantium eum officiis nostrum. Cupiditate veritatis facere
                reiciendis cum fuga iste, ab qui animi culpa ducimus sed
                molestias? Qui, facilis alias? Ipsum sunt corrupti mollitia
                libero a quibusdam, rerum dignissimos, quam magni id unde.
                Quaerat, modi suscipit odio laboriosam alias, eum recusandae
                quod, aut nobis quidem explicabo impedit optio possimus amet ea.
                Non odio, placeat vel officia iusto vitae accusamus velit sint
                quo facere. Est et eius, esse culpa inventore sequi eum soluta
                perspiciatis illo minima, facilis nobis sed numquam similique.
                Soluta, ipsa eum enim amet dolorum error nemo at ab. Sit,
                repudiandae autem. Reiciendis quo eveniet molestias dolore
                exercitationem? Tenetur deleniti magni facere! Ducimus explicabo
                alias deleniti perferendis delectus accusamus deserunt tenetur
                iste dolor ullam, odio aliquid autem aut illum ad officiis
                vitae. Ipsam repellat neque ab debitis accusantium cupiditate
                laudantium, rem perferendis mollitia repudiandae architecto
                voluptatibus laborum et eius nemo iste harum nisi unde
                asperiores tempora placeat officia esse quia. Vitae, odit? Ipsa,
                similique rem. Minus eveniet totam quidem quia asperiores
                nostrum cupiditate corporis error expedita. Consequatur
                aspernatur, sint eum corporis, nisi earum dicta sed quae
                molestias sunt ipsa ex magni porro. Distinctio animi facilis
                doloremque beatae libero laudantium ducimus aliquam molestias,
                voluptates amet fugiat facere perferendis deserunt harum dicta
                eveniet quis sed deleniti repellendus veniam ullam reiciendis?
                Accusantium reprehenderit laudantium nemo. Quod nemo omnis hic
                optio laudantium saepe magni veniam excepturi, tenetur alias
                eveniet quibusdam, quidem recusandae quasi? Ipsum error
                accusamus corporis. Cum nesciunt ab repellat vitae consequatur
                et qui nemo. Magnam deserunt libero cumque magni ea pariatur,
                iusto consectetur, natus, ducimus sunt eum! Quisquam aliquid
                fugit suscipit architecto sunt quas at optio neque porro
                expedita, placeat dolor perferendis sequi tempora?
              </Typography>
            </div>
          </Sheet.Content>
        </Sheet>
      </div>
    );
  },
};
