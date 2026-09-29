import type { Meta, StoryObj } from "@storybook/react";
import {
  FolderGit2,
  HardDrive,
  GitCommitVertical,
  Save,
  TerminalSquare,
  Check,
  Package,
  Truck,
  MapPin,
  CircleAlert,
} from "lucide-react";
import { Avatar } from "../avatar";
import { Badge } from "../badge";
import { Button } from "../button";
import { Card } from "../card";
import { Typography } from "../typography";
import { Timeline } from "./index";
import { ElasticScrollArea } from "../elastic-scroll-area";

const meta: Meta<typeof Timeline> = {
  title: "Components/Data/Timeline",
  component: Timeline,
  subcomponents: {
    "Timeline.Item": Timeline.Item as any,
    "Timeline.Separator": Timeline.Separator as any,
    "Timeline.Connector": Timeline.Connector as any,
    "Timeline.Dot": Timeline.Dot as any,
    "Timeline.Content": Timeline.Content as any,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Timeline>;

export const DeliveryTracking: Story = {
  name: "3. Delivery Tracking",
  render: () => (
    <section className="w-full max-w-lg p-6 text-on-surface" aria-label="Order delivery status">
      <Typography variant="label-medium" muted>ORDER #CH-2048</Typography>
      <Typography as="h2" variant="headline-medium" className="mt-2">Your order is on its way</Typography>
      <Typography variant="body-medium" muted className="mt-2 mb-8">Expected today, 2–5 PM · Cairo</Typography>
      <Timeline aria-label="Delivery milestones">
        <Timeline.Item status="completed">
          <Timeline.Separator><Timeline.Dot size="lg"><Check aria-hidden="true" /></Timeline.Dot><Timeline.Connector /></Timeline.Separator>
          <Timeline.Content><Typography as="h3" variant="title-medium">Order confirmed</Typography><Typography variant="body-small" muted>Completed · Yesterday, 4:12 PM</Typography></Timeline.Content>
        </Timeline.Item>
        <Timeline.Item status="completed">
          <Timeline.Separator><Timeline.Dot size="lg"><Package aria-hidden="true" /></Timeline.Dot><Timeline.Connector variant="dashed" /></Timeline.Separator>
          <Timeline.Content><Typography as="h3" variant="title-medium">Dispatched from warehouse</Typography><Typography variant="body-small" muted>Completed · Today, 8:30 AM</Typography><Typography variant="body-medium" className="mt-2">Package scanned at the Cairo distribution center.</Typography></Timeline.Content>
        </Timeline.Item>
        <Timeline.Item status="current">
          <Timeline.Separator><Timeline.Dot size="lg"><Truck aria-hidden="true" /></Timeline.Dot><Timeline.Connector shape="wavy" animated /></Timeline.Separator>
          <Timeline.Content className="pb-12"><Typography as="h3" variant="title-medium">Out for delivery</Typography><Typography variant="body-small" className="text-primary">Current stage · Today, 11:05 AM</Typography><Typography variant="body-medium" className="mt-2">The courier has your package. Keep your phone available for delivery.</Typography></Timeline.Content>
        </Timeline.Item>
        <Timeline.Item status="pending">
          <Timeline.Separator><Timeline.Dot size="lg"><MapPin aria-hidden="true" /></Timeline.Dot></Timeline.Separator>
          <Timeline.Content className="pb-0"><Typography as="h3" variant="title-medium">Delivered to your address</Typography><Typography variant="body-small" muted>Pending · Signature required</Typography></Timeline.Content>
        </Timeline.Item>
      </Timeline>
    </section>
  ),
};

export const DeliveryException: Story = {
  name: "4. Delivery Exception",
  render: () => (
    <Timeline aria-label="Shipment exception" className="w-full max-w-md p-6">
      <Timeline.Item status="completed">
        <Timeline.Separator><Timeline.Dot><Check aria-hidden="true" /></Timeline.Dot><Timeline.Connector /></Timeline.Separator>
        <Timeline.Content><Typography as="h3" variant="title-medium">Arrived at local hub</Typography><Typography variant="body-small" muted>Completed · 9:10 AM</Typography></Timeline.Content>
      </Timeline.Item>
      <Timeline.Item status="error">
        <Timeline.Separator><Timeline.Dot><CircleAlert aria-hidden="true" /></Timeline.Dot><Timeline.Connector variant="dotted" /></Timeline.Separator>
        <Timeline.Content><Typography as="h3" variant="title-medium">Delivery attempt unsuccessful</Typography><Typography variant="body-small" className="text-error">Action required · 12:40 PM</Typography><Typography variant="body-medium" className="mt-2">The address could not be located. Contact the carrier to confirm delivery instructions.</Typography></Timeline.Content>
      </Timeline.Item>
      <Timeline.Item status="pending">
        <Timeline.Separator><Timeline.Dot variant="outline" /></Timeline.Separator>
        <Timeline.Content><Typography as="h3" variant="title-medium">Delivery rescheduled</Typography><Typography variant="body-small" muted>Pending address confirmation</Typography></Timeline.Content>
      </Timeline.Item>
    </Timeline>
  ),
};

export const VersionControlHistory: Story = {
  name: "1. Version Control (With Custom Icons)",
  parameters: {
    docs: {
      description: {
        story:
          "Features in-view spring animations and Lucide icons rendered cleanly inside the dots.",
      },
    },
  },
  render: () => (
    // We add a fixed height scroll area so you can scroll down and see the animations trigger!
    <ElasticScrollArea className="w-[500px] h-[600px] bg-surface-container rounded-3xl border border-outline-variant/30 text-on-surface shadow-xl">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-4">
            <FolderGit2 className="text-on-surface-variant" />
            <Typography
              variant="headline-small"
              className="font-bold tracking-tight"
            >
              Project Name
            </Typography>
          </div>
          <Typography
            variant="body-small"
            className="text-on-surface-variant font-mono tracking-wide"
          >
            feature/auth
          </Typography>
        </div>

        {/* Badges/Branches */}
        <div className="flex items-center gap-2 mb-8 px-2">
          <Badge variant="outline" shape="full" className="font-mono px-3 py-1">
            main
          </Badge>
          <Badge
            variant="secondary"
            shape="full"
            className="font-mono px-3 py-1"
          >
            feature/auth
          </Badge>
          <Badge variant="outline" shape="full" className="font-mono px-3 py-1">
            bugfix/ui
          </Badge>
        </div>

        <Timeline>
          {/* Item 1: Current Commit */}
          <Timeline.Item>
            <Timeline.Separator className="pt-5">
              {/* Notice we pass an icon directly inside the Dot now */}
              <Timeline.Dot
                variant="primary-container"
                size="lg"
                className="shadow-none"
              >
                <GitCommitVertical strokeWidth={3} />
              </Timeline.Dot>
              <Timeline.Connector />
            </Timeline.Separator>
            <Timeline.Content>
              <Card
                variant="surface-container-low"
                shape="minimal"
                padding="sm"
                className="flex flex-col gap-3 shadow-md border border-outline-variant/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar
                      src="https://i.pravatar.cc/150?u=alex"
                      size="xs"
                      shape="full"
                    />
                    <Typography
                      variant="label-medium"
                      className="font-semibold text-on-surface"
                    >
                      Alex Dev
                    </Typography>
                  </div>
                  <Badge
                    variant="secondary"
                    shape="minimal"
                    className="font-mono text-[11px] opacity-70 bg-surface-container-highest tracking-wider border border-outline-variant/20"
                  >
                    a1b2c3d
                  </Badge>
                </div>
                <Typography
                  variant="body-medium"
                  className="font-mono text-sm leading-relaxed"
                >
                  fix: resolve crash on logout
                </Typography>
                <Typography
                  variant="body-small"
                  className="text-on-surface-variant text-xs"
                >
                  Today • 11:30 AM
                </Typography>
              </Card>
            </Timeline.Content>
          </Timeline.Item>

          {/* Item 2: Shadow Checkpoint */}
          <Timeline.Item>
            <Timeline.Separator>
              <Timeline.Dot
                shape="diamond"
                variant="surface"
                size="md"
                className="mt-1 border-[1.5px]"
              >
                {/* Counter-rotation is handled automatically by the component for diamonds! */}
                <Save
                  strokeWidth={2.5}
                  size={12}
                  className="text-on-surface-variant"
                />
              </Timeline.Dot>
              <Timeline.Connector />
            </Timeline.Separator>
            <Timeline.Content className="pb-8 pt-0.5">
              <div className="flex items-center gap-2 mb-3 text-on-surface-variant">
                <HardDrive size={16} className="shrink-0" />
                <Typography
                  variant="label-medium"
                  className="font-semibold text-xs tracking-wide"
                >
                  Shadow Checkpoint <span className="text-error mx-1">•</span>{" "}
                  10:15 AM
                </Typography>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  shape="full"
                  size="sm"
                  className="h-8 px-4 text-xs font-semibold hover:bg-surface-container-highest"
                >
                  Restore
                </Button>
                <Button
                  variant="outline"
                  shape="full"
                  size="sm"
                  className="h-8 px-4 text-xs font-semibold hover:bg-surface-container-highest"
                >
                  Preview
                </Button>
              </div>
            </Timeline.Content>
          </Timeline.Item>

          {/* Item 3: Auto-saved State */}
          <Timeline.Item>
            <Timeline.Separator>
              <Timeline.Dot
                shape="diamond"
                variant="solid"
                size="sm"
                className="mt-1"
              />
              <Timeline.Connector />
            </Timeline.Separator>
            <Timeline.Content className="pb-8 pt-0">
              <div className="flex items-center h-full">
                <Typography
                  variant="label-medium"
                  className="font-mono text-xs text-on-surface-variant tracking-wider"
                >
                  Auto-saved state • 09:42 AM
                </Typography>
              </div>
            </Timeline.Content>
          </Timeline.Item>

          {/* Item 4: Previous Commit */}
          <Timeline.Item>
            <Timeline.Separator className="pt-5">
              <Timeline.Dot
                variant="primary-container"
                size="lg"
                className="shadow-none"
              >
                <TerminalSquare strokeWidth={2.5} />
              </Timeline.Dot>
            </Timeline.Separator>
            <Timeline.Content className="pb-0">
              <Card
                variant="surface-container-low"
                shape="minimal"
                padding="sm"
                className="flex flex-col gap-3 shadow-md border border-outline-variant/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar
                      src="https://i.pravatar.cc/150?u=sam"
                      size="xs"
                      shape="full"
                    />
                    <Typography
                      variant="label-medium"
                      className="font-semibold text-on-surface"
                    >
                      Sam Coder
                    </Typography>
                  </div>
                  <Badge
                    variant="secondary"
                    shape="minimal"
                    className="font-mono text-[11px] opacity-70 bg-surface-container-highest tracking-wider border border-outline-variant/20"
                  >
                    e9f0a1b
                  </Badge>
                </div>
                <Typography
                  variant="body-medium"
                  className="font-mono text-sm leading-relaxed"
                >
                  feat: implement JWT auth flow
                </Typography>
                <Typography
                  variant="body-small"
                  className="text-on-surface-variant text-xs"
                >
                  Yesterday • 04:20 PM
                </Typography>
              </Card>
            </Timeline.Content>
          </Timeline.Item>
        </Timeline>
      </div>
    </ElasticScrollArea>
  ),
};

export const StandardUsage: Story = {
  name: "2. Basic Semantic Usage",
  render: () => (
    <div className="w-[400px]">
      <Timeline>
        <Timeline.Item>
          <Timeline.Separator>
            <Timeline.Dot variant="primary" />
            <Timeline.Connector />
          </Timeline.Separator>
          <Timeline.Content>
            <Typography variant="title-small">Account Created</Typography>
            <Typography variant="body-small" muted>
              Jan 1, 2024
            </Typography>
          </Timeline.Content>
        </Timeline.Item>
        <Timeline.Item>
          <Timeline.Separator>
            <Timeline.Dot variant="secondary" />
            <Timeline.Connector />
          </Timeline.Separator>
          <Timeline.Content>
            <Typography variant="title-small">Email Verified</Typography>
            <Typography variant="body-small" muted>
              Jan 2, 2024
            </Typography>
          </Timeline.Content>
        </Timeline.Item>
        <Timeline.Item>
          <Timeline.Separator>
            <Timeline.Dot variant="outline" />
            <Timeline.Connector />
          </Timeline.Separator>
          <Timeline.Content>
            <Typography variant="title-small">First Purchase</Typography>
            <Typography variant="body-small" muted>
              Jan 5, 2024
            </Typography>
          </Timeline.Content>
        </Timeline.Item>
        <Timeline.Item>
          <Timeline.Separator>
            <Timeline.Dot variant="ghost" />
          </Timeline.Separator>
          <Timeline.Content>
            <Typography variant="title-small" className="opacity-50">
              Reached Gold Tier
            </Typography>
            <Typography variant="body-small" className="opacity-50">
              Pending
            </Typography>
          </Timeline.Content>
        </Timeline.Item>
      </Timeline>
    </div>
  ),
};
