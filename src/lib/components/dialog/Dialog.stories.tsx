import type { Meta, StoryObj } from "@storybook/react";
import { FileText, Plus, X } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { Typography } from "../typography";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  type DialogContentProps,
  DialogDescription,
  DialogFooter,
  DialogExpand,
  type DialogSide,
  DialogHeader,
  type DialogProps,
  DialogTitle,
  DialogTrigger,
} from "./index";

type StoryComponentProps = DialogProps & Pick<DialogContentProps, "shape">;

const meta: Meta<StoryComponentProps> = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Accessible dialogs and expandable edge sheets. Sheets open from any edge and expand into a full-page workspace while preserving content. The fullscreen variant remains a legacy alias for sheet.",
      },
    },
  },
  argTypes: {
    overlayBlur: {
      control: "select",
      options: ["none", "xs", "sm", "md", "lg", "xl"],
      description: "Blur behind the overlay. Enable overlay for edge sheets.",
    },
    variant: {
      control: "select",
      options: ["basic", "sheet"],
    },
    animation: {
      control: "select",
      options: ["default", "material3"],
      description: "Controls the open/close animation style.",
    },
    glass: {
      control: "boolean",
      description: "Applies a glassmorphism effect to the dialog background.",
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
      if: { arg: "variant", eq: "basic" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const MorphingTransitions: Story = {
  name: "Morphing State Transitions",
  parameters: { layout: "centered" },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [size, setSize] = useState<"small" | "medium" | "large">("medium");
    const [shape, setShape] = useState<"minimal" | "full" | "sharp">("minimal");
    const [variant, setVariant] = useState<
      | "primary"
      | "secondary"
      | "surface-container-high"
      | "surface-container-highest"
    >("surface-container-high");

    return (
      <div className="flex flex-col items-center gap-4">
        <Typography
          variant="body-medium"
          className="text-gray-500 max-w-sm text-center"
        >
          Open the dialog below and use the inner controls to watch dimensions,
          border-radius, and theme colors transition natively.
        </Typography>
        <Button onClick={() => setIsOpen(true)}>Open Morphing Dialog</Button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent
            shape={shape}
            variant={variant}
            className={clsx(
              size === "small" && "max-w-sm",
              size === "medium" && "max-w-md",
              size === "large" && "max-w-2xl",
            )}
          >
            <DialogHeader>
              <DialogTitle>Morphing Dialog</DialogTitle>
              <DialogDescription>
                Testing clean, seamless size adjustments.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 flex flex-col gap-5">
              {/* Color Selection */}
              <div className="flex flex-col gap-1.5">
                <Typography
                  variant="label-small"
                  className="opacity-60 font-bold uppercase tracking-wider"
                >
                  1. Color Variation
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      "surface-container-high",
                      "primary",
                      "secondary",
                      "surface-container-highest",
                    ] as const
                  ).map((v) => (
                    <Button
                      key={v}
                      size="sm"
                      variant={variant === v ? "primary" : "outline"}
                      onClick={() => setVariant(v)}
                    >
                      {v.replace("surface-container-", "")}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Shape / Border Radius */}
              <div className="flex flex-col gap-1.5">
                <Typography
                  variant="label-small"
                  className="opacity-60 font-bold uppercase tracking-wider"
                >
                  2. Shape (Border Radius)
                </Typography>
                <div className="flex gap-2">
                  {(["minimal", "full", "sharp"] as const).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={shape === s ? "primary" : "outline"}
                      onClick={() => setShape(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Dynamic Height Controls */}
              <div className="flex flex-col gap-1.5">
                <Typography
                  variant="label-small"
                  className="opacity-60 font-bold uppercase tracking-wider"
                >
                  3. Dynamic Size (Height)
                </Typography>
                <div className="flex gap-2">
                  {(["small", "medium", "large"] as const).map((sz) => (
                    <Button
                      key={sz}
                      size="sm"
                      variant={size === sz ? "primary" : "outline"}
                      onClick={() => setSize(sz)}
                    >
                      {sz}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Simulating custom inner content dimensions */}
              <div
                className="overflow-hidden border border-dashed border-outline-variant/30 rounded-lg bg-surface-container-lowest transition-all duration-300"
                style={{
                  height:
                    size === "small"
                      ? "60px"
                      : size === "medium"
                        ? "140px"
                        : "240px",
                }}
              >
                <div className="p-4 flex flex-col justify-center items-center h-full text-center">
                  <Typography variant="body-medium" className="font-semibold">
                    {size === "small" && "Compact Box Content"}
                    {size === "medium" && "Standard Box Content"}
                    {size === "large" && "Expanded Box Content"}
                  </Typography>
                  {size !== "small" && (
                    <Typography
                      variant="body-small"
                      className="opacity-60 mt-1 max-w-xs"
                    >
                      The outer framework adjusts smoothly alongside dynamic
                      content layout changes.
                    </Typography>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
};

export const Basic: Story = {
  name: "Basic Dialog",
  args: {
    variant: "basic",
    shape: "minimal",
    animation: "default",
    glass: false,
  },
  parameters: { layout: "centered" },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        variant={args.variant}
        animation={args.animation}
        glass={args.glass}
      >
        <DialogTrigger asChild>
          <Button>Open Basic Dialog</Button>
        </DialogTrigger>
        <DialogContent
          shape={args.shape}
          variant="surface-container-high"
          className="max-w-lg"
        >
          <DialogHeader>
            <DialogTitle>Basic Dialog Title</DialogTitle>
            <DialogDescription>
              This is a standard modal dialog using the{" "}
              <code>surface-container-high</code> variant.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Typography variant="body-medium">
              It floats in the center and has a scale/fade animation.
            </Typography>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button onClick={() => setIsOpen(false)}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

export const Controlled: Story = {
  name: "Controlled Dialog (State-driven)",
  args: {
    variant: "basic",
    shape: "minimal",
    animation: "default",
    glass: false,
  },
  parameters: { layout: "centered" },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <Button onClick={() => setIsOpen(true)}>
            Open Dialog (External State)
          </Button>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Force Close (External State)
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          Current state: <strong>{isOpen ? "Open" : "Closed"}</strong>
        </div>

        <Dialog
          open={isOpen}
          onOpenChange={setIsOpen}
          variant={args.variant}
          animation={args.animation}
          glass={args.glass}
        >
          <DialogContent
            shape={args.shape}
            variant="surface-container-high"
            className="max-w-lg"
          >
            <DialogHeader>
              <DialogTitle>Controlled Dialog</DialogTitle>
              <DialogDescription>
                This dialog's open state is managed entirely by the parent
                component's state.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Typography variant="body-medium">
                No Trigger component was used to mount this dialog. The state is
                bound to standard buttons external to the dialog tree.
              </Typography>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Close from Inside
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
};

export const MaterialAnimation: Story = {
  name: "Material Design 3 Animation",
  args: {
    variant: "basic",
    shape: "full",
    animation: "material3",
    glass: false,
  },
  parameters: { layout: "centered" },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        variant={args.variant}
        animation={args.animation}
        glass={args.glass}
      >
        <DialogTrigger asChild>
          <Button variant="secondary">Open Material Dialog</Button>
        </DialogTrigger>
        <DialogContent
          shape={args.shape}
          variant="surface-container-highest"
          className="max-w-lg"
        >
          <DialogHeader>
            <DialogTitle>Material Design 3</DialogTitle>
            <DialogDescription>
              Notice the slide-down and grow animation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Typography variant="body-medium">
              This animation mimics the official Material Web implementation
              using Emphasized easing curves.
            </Typography>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button>Agree</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

// Keep the existing story URL working while replacing the old fullscreen demo.
export const FullScreen: Story = {
  name: "Expandable Edge Sheet",
  args: { variant: "sheet" },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [side, setSide] = useState<DialogSide>("bottom");
    const [coverage, setCoverage] = useState(0.48);
    const [overlay, setOverlay] = useState(false);
    const [showDragHandle, setShowDragHandle] = useState(true);
    const [closeOnOutsideClick, setCloseOnOutsideClick] = useState(false);
    const [items, setItems] = useState([
      {
        description: "Consulting services",
        department: "Strategy",
        account: "6200 · Professional services",
        location: "Dublin HQ",
        price: "$90,000.00",
      },
      {
        description: "Advisory workshop",
        department: "Engineering",
        account: "6210 · IT consulting",
        location: "San Francisco",
        price: "$21,600.00",
      },
      {
        description: "Training sessions",
        department: "Strategy",
        account: "6200 · Professional services",
        location: "Dublin HQ",
        price: "$16,800.00",
      },
      {
        description: "On-site support",
        department: "Engineering",
        account: "6210 · IT consulting",
        location: "San Francisco",
        price: "$19,680.00",
      },
      {
        description: "Quarterly retainer",
        department: "Operations",
        account: "6300 · Subscriptions",
        location: "Dublin HQ",
        price: "$12,720.00",
      },
    ]);
    return (
      <div className="min-h-screen bg-surface text-on-surface">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant px-6 py-5">
          <div className="flex items-center gap-3">
            <FileText className="text-primary" />
            <strong>Invoice 123-981-223</strong>
            <span className="rounded-full bg-surface-container px-3 py-1 text-xs">
              Draft
            </span>
          </div>
          <Button size="sm" onClick={() => setIsOpen(true)}>
            Review line items
          </Button>
        </header>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-outline-variant bg-surface-container-low px-6 py-4 text-sm">
          <label className="flex items-center gap-3">
            Partial coverage{" "}
            <strong className="w-10 tabular-nums">
              {Math.round(coverage * 100)}%
            </strong>
            <input
              aria-label="Partial coverage"
              type="range"
              min="20"
              max="90"
              step="1"
              value={Math.round(coverage * 100)}
              onChange={(event) =>
                setCoverage(Number(event.target.value) / 100)
              }
              className="w-36 accent-primary"
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={overlay}
              onChange={(event) => setOverlay(event.target.checked)}
              className="accent-primary"
            />{" "}
            Show overlay
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={closeOnOutsideClick}
              onChange={(event) => setCloseOnOutsideClick(event.target.checked)}
              className="accent-primary"
            />{" "}
            Close on outside click
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showDragHandle}
              onChange={(event) => setShowDragHandle(event.target.checked)}
              className="accent-primary"
            />
            Show drag handle
          </label>
        </div>
        <main className="mx-auto grid max-w-7xl gap-8 p-6 md:grid-cols-2 md:p-10">
          <div className="rounded-2xl bg-surface-container-low p-6 md:p-10">
            <div className="min-h-80 rounded-lg border border-outline-variant bg-surface p-8 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                Lumen Consulting
              </p>
              <h1 className="mt-6 text-3xl font-semibold">Invoice</h1>
              <p className="mt-2 text-sm text-on-surface-variant">
                Professional services · September 2026
              </p>
              <div className="mt-10 flex justify-between border-t border-outline-variant pt-5 text-sm">
                <span>Bill to</span>
                <strong>Nest Studios Inc.</strong>
              </div>
              <div className="mt-5 flex justify-between text-sm">
                <span>Total due</span>
                <strong>$160,800.00</strong>
              </div>
            </div>
          </div>
          <section className="space-y-6 py-2">
            <div>
              <p className="text-sm text-primary">Invoice details</p>
              <h2 className="mt-3 text-2xl font-semibold">Lumen Consulting</h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                TIN •••• 3213 · VAT •••• 5453
              </p>
              <label className="mt-4 block text-sm">
                Invoice reference
                <input
                  className="mt-2 block w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 focus-visible:outline-primary"
                  defaultValue="INV-2026-091"
                />
              </label>
            </div>
            <div className="rounded-xl border border-outline-variant p-5">
              <h3 className="font-semibold">PO #87</h3>
              <p className="mt-1 text-sm text-on-surface-variant">
                Requested by Kevin Yoon
              </p>
              <p className="mt-5">
                <strong>$39,200.00</strong> remaining
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/20">
                <div className="h-full w-4/5 bg-primary" />
              </div>
              <p className="mt-3 text-sm">Net billed USD $160,800</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Open sheet from</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["top", "bottom", "left", "right"] as const).map((edge) => (
                  <Button
                    key={edge}
                    size="sm"
                    variant={side === edge ? "primary" : "outline"}
                    onClick={() => {
                      setSide(edge);
                      setExpanded(false);
                      setIsOpen(true);
                    }}
                  >
                    {edge.charAt(0).toUpperCase() + edge.slice(1)}
                  </Button>
                ))}
              </div>
              <p className="mt-3 text-sm text-on-surface-variant">
                {showDragHandle
                  ? "Drag anywhere on the handle row. Release to settle at the partial size or full page, or swipe toward the edge to dismiss."
                  : "Use the expand control for a full-page workspace, or close the sheet to return to the invoice."}
              </p>
            </div>
          </section>
        </main>
        <Dialog
          open={isOpen}
          onOpenChange={setIsOpen}
          variant="sheet"
          side={side}
          expanded={expanded}
          onExpandedChange={setExpanded}
          glass={args.glass}
          sheetSize={coverage}
          overlay={overlay}
          closeOnOutsideClick={closeOnOutsideClick}
          showDragHandle={showDragHandle}
        >
          <DialogContent>
            <DialogHeader className="gap-3 px-5 py-5 sm:px-6 sm:py-5">
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg font-semibold">
                  {items.length} line items
                </DialogTitle>
                <DialogDescription className="mt-1 text-xs text-on-surface-variant">
                  Invoice 123-981-223 · Lumen Consulting
                </DialogDescription>
              </div>
              <DialogExpand />
              <DialogClose asChild>
                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label="Close line items"
                >
                  <X size={20} />
                </IconButton>
              </DialogClose>
            </DialogHeader>
            <DialogBody elasticity={false} className="px-5 sm:px-6">
              <div className="overflow-x-auto pb-4">
                <table className="w-full min-w-[760px] border-collapse text-start text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant text-on-surface-variant">
                      {[
                        "Description",
                        "Department",
                        "Account",
                        "Location",
                        "Price",
                      ].map((label) => (
                        <th
                          key={label}
                          className="px-3 py-4 text-start text-xs font-medium"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-outline-variant/60"
                      >
                        <td className="px-3 py-4">
                          <input
                            aria-label={"Line " + (index + 1) + " description"}
                            value={item.description}
                            onChange={(event) =>
                              setItems((current) =>
                                current.map((row, i) =>
                                  i === index
                                    ? {
                                        ...row,
                                        description: event.target.value,
                                      }
                                    : row,
                                ),
                              )
                            }
                            className="w-full min-w-48 rounded bg-transparent py-2 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          />
                        </td>
                        <td className="px-3 py-4">{item.department}</td>
                        <td className="px-3 py-4">{item.account}</td>
                        <td className="px-3 py-4">{item.location}</td>
                        <td className="whitespace-nowrap px-3 py-4 font-medium">
                          {item.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DialogBody>
            <DialogFooter className="items-center justify-between gap-3 px-5 py-4 sm:px-6 sm:py-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setItems((current) => [
                    ...current,
                    {
                      description: "New line item",
                      department: "Operations",
                      account: "6300 · Subscriptions",
                      location: "Dublin HQ",
                      price: "$0.00",
                    },
                  ])
                }
              >
                <Plus size={16} /> Add line
              </Button>
              <p className="text-sm">
                Total USD <strong>$160,800.00</strong>
              </p>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
};
