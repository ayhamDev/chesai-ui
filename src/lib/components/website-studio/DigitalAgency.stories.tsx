// src/lib/components/website-studio/DigitalAgency.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  useNavigate,
} from "@tanstack/react-router";
import { clsx } from "clsx";
import {
  ArrowRight,
  LineChart,
  Megaphone,
  MousePointerClick,
  Settings,
  Sparkles,
  Plus, // <-- Imported Plus icon
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import { WebsiteStudio } from "../index";
import type {
  ComponentRegistry,
  WebsiteSchema,
  DesignSystemSchema,
} from "../types";

const meta: Meta<typeof WebsiteStudio.Renderer> = {
  title: "Website Studio/Digital Agency (Composable Primitives)",
  component: WebsiteStudio.Renderer,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof WebsiteStudio.Renderer>;

// ============================================================================
// GLOBAL STYLES & THEME TOKENS
// ============================================================================

const customHeadCode = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
  <style>
    .font-serif-display { font-family: 'EB Garamond', serif; }
    .font-sans-body { font-family: 'Inter', sans-serif; }
    .font-mono-code { font-family: 'JetBrains Mono', monospace; }
    
    body {
      background-color: var(--color-canvas);
      color: var(--color-ink);
    }
  </style>
`;

const agencyDesignSystem: DesignSystemSchema = {
  tokens: {
    "--color-primary": "#cc785c",
    "--color-primary-active": "#a9583e",
    "--color-canvas": "#faf9f5",
    "--color-surface-card": "#efe9de",
    "--color-surface-dark": "#181715",
    "--color-surface-dark-elevated": "#252320",
    "--color-surface-dark-soft": "#1f1e1b",
    "--color-ink": "#141413",
    "--color-body": "#3d3d3a",
    "--color-muted": "#6c6a64",
    "--color-muted-soft": "#8e8b82",
    "--color-hairline": "#e6dfd8",
    "--color-on-primary": "#ffffff",
    "--color-on-dark": "#faf9f5",
    "--color-on-dark-soft": "#a09d96",
    "--color-accent-teal": "#5db8a6",
    "--color-accent-amber": "#e8a55a",
    "--color-success": "#5db872",
    "--color-warning": "#d4a017",
    "--color-error": "#c64545",
  },
};

// ============================================================================
// STATIC COMPILE-SAFE CLASS DICTIONARIES
// ============================================================================

const sectionsBgMap: Record<string, string> = {
  canvas: "bg-[var(--color-canvas)]",
  "surface-dark": "bg-[var(--color-surface-dark)]",
  "surface-card": "bg-[var(--color-surface-card)]",
  primary: "bg-[var(--color-primary)]",
  transparent: "bg-transparent",
};

const sectionsPaddingMap: Record<string, string> = {
  none: "py-0",
  sm: "py-8 md:py-12",
  md: "py-16 lg:py-[96px]",
  lg: "py-24 lg:py-32",
};

const flexDirections: Record<string, string> = {
  row: "flex-row",
  column: "flex-col",
  responsive: "flex-col lg:flex-row",
};

const flexAlignments: Record<string, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const flexJustifications: Record<string, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

const layoutGaps: Record<string, string> = {
  none: "gap-0",
  xs: "gap-2",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-10 md:gap-12",
  xxl: "gap-16",
};

const gridColumns: Record<string, string> = {
  "1": "grid-cols-1",
  "2": "grid-cols-2",
  "3": "grid-cols-3",
  "4": "grid-cols-4",
  "responsive-3": "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  "responsive-4": "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
};

const boxPaddings: Record<string, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6 md:p-[32px]",
  lg: "p-10 md:p-[64px]",
};

const boxRadii: Record<string, string> = {
  none: "rounded-none",
  md: "rounded-[8px]",
  lg: "rounded-[12px]",
  xl: "rounded-[16px]",
  full: "rounded-full",
};

const textVariants: Record<string, string> = {
  "display-xl":
    "font-serif-display font-normal text-[40px] md:text-[64px] leading-[1.1] md:leading-[1.05] tracking-[-1px] md:tracking-[-1.5px]",
  "display-lg":
    "font-serif-display font-normal text-[32px] md:text-[48px] leading-[1.15] md:leading-[1.1] tracking-[-0.5px] md:tracking-[-1px]",
  "display-md":
    "font-serif-display font-normal text-[28px] md:text-[36px] leading-[1.2] md:leading-[1.15] tracking-[-0.3px] md:tracking-[-0.5px]",
  "display-sm":
    "font-serif-display font-normal text-[24px] md:text-[28px] leading-[1.25] md:leading-[1.2] tracking-[-0.3px]",
  "title-lg": "font-sans-body font-semibold text-[18px]",
  "body-lg":
    "font-sans-body font-normal text-[16px] md:text-[18px] leading-[1.55]",
  "body-md":
    "font-sans-body font-normal text-[15px] md:text-[16px] leading-[1.55]",
  "body-sm":
    "font-sans-body font-normal text-[13px] md:text-[14px] leading-[1.5]",
  "nav-brand": "font-sans-body font-semibold text-[18px] tracking-tight",
  "nav-link": "font-sans-body font-medium text-[14px]",
  label:
    "font-sans-body font-medium text-[11px] md:text-[13px] uppercase tracking-[1.5px]",
};

const textColors: Record<string, string> = {
  ink: "text-[var(--color-ink)]",
  body: "text-[var(--color-body)]",
  muted: "text-[var(--color-muted)]",
  "muted-soft": "text-[var(--color-muted-soft)]",
  "on-primary": "text-[var(--color-on-primary)]",
  "on-dark": "text-[var(--color-on-dark)]",
  "on-dark-soft": "text-[var(--color-on-dark-soft)]",
};

// ============================================================================
// VISUAL DROP ZONE STATE (Empty layout placeholder)
// ============================================================================

const EmptyPlaceholder = ({ label }: { label: string }) => {
  return (
    <div className="w-full min-h-[96px] border-2 border-dashed border-[var(--color-primary)]/30 hover:border-[var(--color-primary)]/60 bg-[var(--color-surface-card)]/10 hover:bg-[var(--color-surface-card)]/25 rounded-[12px] flex flex-col items-center justify-center p-5 transition-all cursor-pointer pointer-events-none select-none my-2">
      <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-1.5 animate-pulse">
        <Plus size={16} />
      </div>
      <span className="text-[12px] font-sans-body font-semibold text-[var(--color-ink)] opacity-70">
        {label}
      </span>
      <span className="text-[10px] font-sans-body text-[var(--color-muted-soft)] mt-0.5">
        Drag components from the side panels
      </span>
    </div>
  );
};

// ============================================================================
// COMPOSABLE PRIMITIVE REGISTRY
// ============================================================================

const agencyRegistry: ComponentRegistry = {
  // 1. SECTION
  AgencySection: {
    name: "Section Container",
    category: "Layout",
    acceptsChildren: true,
    render: ({
      bg = "canvas",
      padding = "md",
      className,
      children,
      ...props
    }) => {
      const bgClass = sectionsBgMap[bg] || sectionsBgMap.canvas;
      const paddingClass = sectionsPaddingMap[padding] || sectionsPaddingMap.md;
      const isEmpty = !children || React.Children.count(children) === 0;

      return (
        <section
          className={clsx(
            "w-full px-4 md:px-12 flex justify-center",
            bgClass,
            paddingClass,
            className,
          )}
          {...props}
        >
          <div className="max-w-[1200px] w-full flex flex-col h-full">
            {isEmpty ? (
              <EmptyPlaceholder label="Empty Section. Drop containers or columns here." />
            ) : (
              children
            )}
          </div>
        </section>
      );
    },
    controls: {
      bg: {
        type: "select",
        label: "Background",
        options: Object.keys(sectionsBgMap).map((k) => ({
          label: k,
          value: k,
        })),
        defaultValue: "canvas",
      },
      padding: {
        type: "select",
        label: "Vertical Spacing",
        options: Object.keys(sectionsPaddingMap).map((k) => ({
          label: k,
          value: k,
        })),
        defaultValue: "md",
      },
    },
  },

  // 2. FLEX
  AgencyFlex: {
    name: "Flex Layout",
    category: "Layout",
    acceptsChildren: true,
    render: ({
      direction = "row",
      align = "stretch",
      justify = "start",
      gap = "none",
      wrap = false,
      className,
      children,
      ...props
    }) => {
      const dClass = flexDirections[direction] || flexDirections.row;
      const aClass = flexAlignments[align] || flexAlignments.stretch;
      const jClass = flexJustifications[justify] || flexJustifications.start;
      const gClass = layoutGaps[gap] || layoutGaps.none;
      const isEmpty = !children || React.Children.count(children) === 0;

      return (
        <div
          className={clsx(
            "flex",
            dClass,
            aClass,
            jClass,
            gClass,
            wrap && "flex-wrap",
            className,
          )}
          {...props}
        >
          {isEmpty ? (
            <EmptyPlaceholder label="Empty Flex Box. Drop items here." />
          ) : (
            children
          )}
        </div>
      );
    },
    controls: {
      direction: {
        type: "select",
        label: "Direction",
        options: Object.keys(flexDirections).map((k) => ({
          label: k,
          value: k,
        })),
        defaultValue: "row",
      },
      align: {
        type: "select",
        label: "Align Items",
        options: Object.keys(flexAlignments).map((k) => ({
          label: k,
          value: k,
        })),
        defaultValue: "stretch",
      },
      justify: {
        type: "select",
        label: "Justification",
        options: Object.keys(flexJustifications).map((k) => ({
          label: k,
          value: k,
        })),
        defaultValue: "start",
      },
      gap: {
        type: "select",
        label: "Gap Size",
        options: Object.keys(layoutGaps).map((k) => ({ label: k, value: k })),
        defaultValue: "none",
      },
      wrap: { type: "boolean", label: "Allow Wrapping", defaultValue: false },
    },
  },

  // 3. GRID
  AgencyGrid: {
    name: "Grid Layout",
    category: "Layout",
    acceptsChildren: true,
    render: ({ cols = "1", gap = "sm", className, children, ...props }) => {
      const cClass = gridColumns[cols] || gridColumns["1"];
      const gClass = layoutGaps[gap] || layoutGaps.sm;
      const isEmpty = !children || React.Children.count(children) === 0;

      return (
        <div className={clsx("grid", cClass, gClass, className)} {...props}>
          {isEmpty ? (
            <EmptyPlaceholder label="Empty Grid. Drop cards or elements here." />
          ) : (
            children
          )}
        </div>
      );
    },
    controls: {
      cols: {
        type: "select",
        label: "Columns Structure",
        options: Object.keys(gridColumns).map((k) => ({ label: k, value: k })),
        defaultValue: "1",
      },
      gap: {
        type: "select",
        label: "Gap",
        options: Object.keys(layoutGaps).map((k) => ({ label: k, value: k })),
        defaultValue: "sm",
      },
    },
  },

  // 4. BOX
  AgencyBox: {
    name: "Styled Container",
    category: "Layout",
    acceptsChildren: true,
    render: ({
      bg = "transparent",
      radius = "none",
      border = false,
      padding = "none",
      className,
      children,
      ...props
    }) => {
      const bgClass = sectionsBgMap[bg] || sectionsBgMap.transparent;
      const rClass = boxRadii[radius] || boxRadii.none;
      const pClass = boxPaddings[padding] || boxPaddings.none;
      const bClass = border ? "border border-[var(--color-hairline)]" : "";
      const isEmpty = !children || React.Children.count(children) === 0;

      return (
        <div
          className={clsx(bgClass, rClass, bClass, pClass, className)}
          {...props}
        >
          {isEmpty ? (
            <EmptyPlaceholder label="Empty Box wrapper. Drop content here." />
          ) : (
            children
          )}
        </div>
      );
    },
    controls: {
      bg: {
        type: "select",
        label: "Background",
        options: Object.keys(sectionsBgMap).map((k) => ({
          label: k,
          value: k,
        })),
        defaultValue: "transparent",
      },
      radius: {
        type: "select",
        label: "Border Radius",
        options: Object.keys(boxRadii).map((k) => ({ label: k, value: k })),
        defaultValue: "none",
      },
      border: { type: "boolean", label: "Include Border", defaultValue: false },
      padding: {
        type: "select",
        label: "Inner Padding",
        options: Object.keys(boxPaddings).map((k) => ({ label: k, value: k })),
        defaultValue: "none",
      },
    },
  },

  // 5. TEXT
  AgencyText: {
    name: "Text Content",
    category: "Elements",
    render: ({
      variant = "body-md",
      color = "ink",
      align = "left",
      className,
      children="lorem ipsum",
      ...props
    }) => {
      const vClass = textVariants[variant] || textVariants["body-md"];
      const cClass = textColors[color] || textColors["ink"];
      const aClass = `text-${align}`;

      return (
        <div
          className={clsx(vClass, cClass, aClass, className)}
          data-studio-editable="children"
          {...props}
        >
          {children}
        </div>
      );
    },
    controls: {
      variant: {
        type: "select",
        label: "Typography Style",
        options: Object.keys(textVariants).map((k) => ({ label: k, value: k })),
        defaultValue: "body-md",
      },
      color: {
        type: "select",
        label: "Color Theme",
        options: Object.keys(textColors).map((k) => ({ label: k, value: k })),
        defaultValue: "ink",
      },
      align: {
        type: "select",
        label: "Alignment",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
        defaultValue: "left",
      },
      children: {
        type: "textarea",
        label: "Content Text",
        supportsCMS: true,
        defaultValue: "Placeholder Text Block.",
      },
    },
  },

  // 6. ICON
  AgencyIcon: {
    name: "Vector Icon",
    category: "Elements",
    render: ({
      name = "Sparkles",
      size = 24,
      color = "ink",
      className,
      ...props
    }) => {
      const IconMap: any = {
        LineChart,
        Megaphone,
        MousePointerClick,
        Sparkles,
      };
      const IconComponent = IconMap[name] || Sparkles;
      const cClass = textColors[color] || textColors["ink"];

      return (
        <IconComponent
          size={size}
          className={clsx(cClass, className)}
          {...props}
        />
      );
    },
    controls: {
      name: {
        type: "select",
        label: "Icon Selection",
        options: [
          { label: "Sparkles", value: "Sparkles" },
          { label: "Chart / Growth", value: "LineChart" },
          { label: "Megaphone", value: "Megaphone" },
          { label: "Cursor Click", value: "MousePointerClick" },
        ],
        defaultValue: "Sparkles",
      },
      size: { type: "number", label: "Size (px)", defaultValue: 24 },
      color: {
        type: "select",
        label: "Color Stream",
        options: Object.keys(textColors).map((k) => ({ label: k, value: k })),
        defaultValue: "ink",
      },
    },
  },

  // 7. BUTTON
  AgencyButton: {
    name: "Interactive Button",
    category: "Elements",
    render: ({
      variant = "primary",
      endIcon = "none",
      children = "Button",
      className,
      ...props
    }) => {
      const vClasses =
        {
          primary:
            "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-active)] border-transparent",
          secondary:
            "bg-transparent border-[var(--color-hairline)] text-[var(--color-ink)] hover:bg-[var(--color-surface-card)]",
          "dark-outline":
            "bg-[var(--color-surface-dark-elevated)] text-[var(--color-on-dark)] border-[#3d3d3a] hover:bg-[#2e2b28]",
          white:
            "bg-[var(--color-canvas)] text-[var(--color-ink)] hover:bg-[var(--color-surface-card)] border-transparent",
        }[variant as string] || "";

      const IconMap: any = { ArrowRight };
      const EndIcon = endIcon && endIcon !== "none" ? IconMap[endIcon] : null;

      return (
        <button
          className={clsx(
            "font-sans-body text-[14px] font-medium rounded-[8px] h-[40px] px-[20px] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 border",
            vClasses,
            className,
          )}
          {...props}
        >
          <span data-studio-editable="children">{children}</span>
          {EndIcon && <EndIcon size={16} />}
        </button>
      );
    },
    controls: {
      variant: {
        type: "select",
        label: "Variant Theme",
        options: [
          { label: "Primary Color", value: "primary" },
          { label: "Secondary Border", value: "secondary" },
          { label: "Dark Context", value: "dark-outline" },
          { label: "Inverted White", value: "white" },
        ],
        defaultValue: "primary",
      },
      endIcon: {
        type: "select",
        label: "Trailing Icon",
        options: [
          { label: "None", value: "none" },
          { label: "Arrow Right", value: "ArrowRight" },
        ],
        defaultValue: "none",
      },
      children: { type: "text", label: "Button Label", defaultValue: "Button" },
    },
  },

  // 8. BESPOKE MOCKUP GRAPHIC (Hero Visual)
  AgencyHeroGraphic: {
    name: "Hero Chart Graphic",
    category: "Media",
    render: ({ className, ...props }) => (
      <div
        className={clsx(
          "w-full bg-[var(--color-surface-card)] rounded-[16px] min-h-[300px] md:min-h-[400px] border border-[var(--color-hairline)] flex items-center justify-center p-4 md:p-8 relative overflow-hidden",
          className,
        )}
        {...props}
      >
        <div className="absolute top-12 left-12 right-12 bottom-0 border-t border-l border-[#cc785c]/30">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0,80 Q25,60 50,40 T100,10"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
            />
            <circle cx="50" cy="40" r="3" fill="var(--color-ink)" />
            <circle cx="100" cy="10" r="3" fill="var(--color-ink)" />
          </svg>
        </div>
        <div className="bg-[var(--color-canvas)] border border-[var(--color-hairline)] p-5 md:p-6 rounded-[12px] shadow-sm z-10 w-[90%] md:w-3/4 max-w-sm transform translate-y-4 md:translate-y-8">
          <div className="font-sans-body text-[11px] md:text-[13px] font-medium text-[var(--color-muted-soft)] uppercase tracking-[1.5px] mb-2">
            Q3 Conversion Growth
          </div>
          <div className="font-serif-display text-[28px] md:text-[36px] text-[var(--color-ink)] leading-[1.2] tracking-[-0.3px] mb-1">
            +248%
          </div>
          <div className="w-full bg-[#f5f0e8] h-2 rounded-full overflow-hidden mt-4">
            <div className="bg-[var(--color-primary)] w-[75%] h-full rounded-full" />
          </div>
        </div>
      </div>
    ),
    controls: {},
  },

  // 9. BESPOKE CODE WINDOW (Mockup)
  AgencyCodeWindow: {
    name: "Code Editor Mockup",
    category: "Media",
    render: ({ className, ...props }) => (
      <div
        className={clsx(
          "w-full bg-[var(--color-surface-dark-soft)] border border-[#3d3d3a] rounded-[12px] overflow-hidden flex flex-col shadow-2xl",
          className,
        )}
        {...props}
      >
        <div className="h-10 bg-[var(--color-surface-dark-elevated)] flex items-center px-4 gap-2 border-b border-[#3d3d3a] shrink-0">
          <div className="w-3 h-3 rounded-full bg-[var(--color-error)]" />
          <div className="w-3 h-3 rounded-full bg-[var(--color-warning)]" />
          <div className="w-3 h-3 rounded-full bg-[var(--color-success)]" />
          <span className="ml-4 font-sans-body text-[12px] text-[var(--color-muted-soft)] truncate">
            attribution_engine.ts
          </span>
        </div>
        <div className="p-4 md:p-[24px] font-mono-code text-[12px] md:text-[14px] text-[var(--color-on-dark)] leading-[1.6] overflow-x-auto w-full whitespace-pre">
          <span className="text-[var(--color-primary)]">import</span>{" "}
          {"{ Metrics, Tracker }"}{" "}
          <span className="text-[var(--color-primary)]">from</span>{" "}
          <span className="text-[#5db8a6]">'@vantage/core'</span>;<br />
          <br />
          <span className="text-[var(--color-primary)]">const</span> engine ={" "}
          <span className="text-[var(--color-primary)]">new</span>{" "}
          Tracker(&#123;
          <br />
          &nbsp;&nbsp;mode:{" "}
          <span className="text-[#5db8a6]">'deterministic'</span>,<br />
          &nbsp;&nbsp;realtime: <span className="text-[#e8a55a]">true</span>,
          <br />
          &#125;);
          <br />
          <br />
          <span className="text-[var(--color-muted-soft)]">
            // Process omnichannel streams
          </span>
          <br />
          engine.analyze(campaignData).then(insights =&gt; &#123;
          <br />
          &nbsp;&nbsp;console.log(insights.ROAS);
          <br />
          &#125;);
        </div>
      </div>
    ),
    controls: {},
  },
};

// ============================================================================
// STABLE CONFIG-COMPLIANT SCHEMA (Pre-assigned mapped inputs)
// ============================================================================
const agencyWebsiteSchema: WebsiteSchema = {
  projectSettings: { name: "Vantage Digital" },
  designSystem: agencyDesignSystem,
  pages: [
    {
      id: "page_home",
      slug: "/",
      title: "Home",
      content: [
        // --- NAVBAR SECTION ---
        {
          id: "nav_section",
          type: "AgencySection",
          props: {
            bg: "canvas",
            padding: "none",
            className: "border-b border-[var(--color-hairline)] h-[64px]",
          },
          children: [
            {
              id: "nav_flex",
              type: "AgencyFlex",
              props: {
                direction: "row",
                justify: "between",
                align: "center",
                className: "h-full w-full",
              },
              children: [
                {
                  id: "nav_logo",
                  type: "AgencyFlex",
                  props: {
                    direction: "row",
                    align: "center",
                    gap: "xs",
                    className: "shrink-0",
                  },
                  children: [
                    {
                      id: "nav_icon",
                      type: "AgencyIcon",
                      props: { name: "Sparkles", color: "ink", size: 20 },
                    },
                    {
                      id: "nav_title",
                      type: "AgencyText",
                      props: {
                        variant: "nav-brand",
                        color: "ink",
                        children: "Vantage",
                      },
                    },
                  ],
                },
                {
                  id: "nav_links",
                  type: "AgencyFlex",
                  props: {
                    direction: "row",
                    align: "center",
                    gap: "lg",
                    className: "hidden md:flex",
                  },
                  children: [
                    {
                      id: "nav_l1",
                      type: "AgencyText",
                      props: {
                        variant: "nav-link",
                        color: "body",
                        className:
                          "cursor-pointer hover:text-[var(--color-ink)] transition-colors",
                        children: "Expertise",
                      },
                    },
                    {
                      id: "nav_l2",
                      type: "AgencyText",
                      props: {
                        variant: "nav-link",
                        color: "body",
                        className:
                          "cursor-pointer hover:text-[var(--color-ink)] transition-colors",
                        children: "Methodology",
                      },
                    },
                    {
                      id: "nav_l3",
                      type: "AgencyText",
                      props: {
                        variant: "nav-link",
                        color: "body",
                        className:
                          "cursor-pointer hover:text-[var(--color-ink)] transition-colors",
                        children: "Case Studies",
                      },
                    },
                  ],
                },
                {
                  id: "nav_actions",
                  type: "AgencyFlex",
                  props: {
                    direction: "row",
                    align: "center",
                    gap: "sm",
                    className: "shrink-0",
                  },
                  children: [
                    {
                      id: "nav_signin",
                      type: "AgencyText",
                      props: {
                        variant: "nav-link",
                        color: "ink",
                        className:
                          "hidden sm:block cursor-pointer hover:underline underline-offset-4 decoration-[var(--color-primary)]",
                        children: "Sign In",
                      },
                    },
                    {
                      id: "nav_btn",
                      type: "AgencyButton",
                      props: { variant: "primary", children: "Start Project" },
                    },
                  ],
                },
              ],
            },
          ],
        },

        // --- HERO SECTION ---
        {
          id: "hero_section",
          type: "AgencySection",
          props: { bg: "canvas", padding: "md" },
          children: [
            {
              id: "hero_flex",
              type: "AgencyFlex",
              props: { direction: "responsive", align: "center", gap: "xl" },
              children: [
                {
                  id: "hero_left",
                  type: "AgencyFlex",
                  props: {
                    direction: "column",
                    align: "start",
                    gap: "md",
                    className: "flex-1 w-full max-w-2xl lg:max-w-none",
                  },
                  children: [
                    {
                      id: "hero_title",
                      type: "AgencyText",
                      props: {
                        variant: "display-xl",
                        color: "ink",
                        children: "Precision marketing for modern brands.",
                      },
                    },
                    {
                      id: "hero_sub",
                      type: "AgencyText",
                      props: {
                        variant: "body-lg",
                        color: "body",
                        className: "max-w-xl",
                        children:
                          "We combine rigorous data science with editorial creative to drive asymmetrical growth for B2B and SaaS companies.",
                      },
                    },
                    {
                      id: "hero_actions",
                      type: "AgencyFlex",
                      props: {
                        direction: "row",
                        align: "center",
                        gap: "sm",
                        wrap: true,
                        className: "mt-2",
                      },
                      children: [
                        {
                          id: "hero_btn_1",
                          type: "AgencyButton",
                          props: {
                            variant: "primary",
                            children: "View Case Studies",
                          },
                        },
                        {
                          id: "hero_btn_2",
                          type: "AgencyButton",
                          props: {
                            variant: "secondary",
                            children: "Our Methodology",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  id: "hero_right",
                  type: "AgencyHeroGraphic",
                  props: { className: "w-full lg:flex-1" },
                },
              ],
            },
          ],
        },

        // --- FEATURES SECTION ---
        {
          id: "feat_section",
          type: "AgencySection",
          props: { bg: "canvas", padding: "md" },
          children: [
            {
              id: "feat_container",
              type: "AgencyFlex",
              props: { direction: "column", gap: "xl" },
              children: [
                {
                  id: "feat_title",
                  type: "AgencyText",
                  props: {
                    variant: "display-lg",
                    align: "center",
                    children: "Growth, engineered systematically.",
                  },
                },
                {
                  id: "feat_grid",
                  type: "AgencyGrid",
                  props: { cols: "responsive-3", gap: "md" },
                  children: [
                    {
                      id: "fc_1",
                      type: "AgencyBox",
                      props: {
                        bg: "surface-card",
                        radius: "lg",
                        border: true,
                        padding: "md",
                        className: "flex flex-col gap-4 h-full",
                      },
                      children: [
                        {
                          id: "fci_1",
                          type: "AgencyBox",
                          props: {
                            bg: "canvas",
                            radius: "full",
                            border: true,
                            padding: "none",
                            className:
                              "w-10 h-10 flex items-center justify-center shrink-0",
                          },
                          children: [
                            {
                              id: "fci_icon1",
                              type: "AgencyIcon",
                              props: { name: "Megaphone", size: 20 },
                            },
                          ],
                        },
                        {
                          id: "fct_1",
                          type: "AgencyText",
                          props: {
                            variant: "title-lg",
                            color: "ink",
                            children: "Paid Acquisition",
                          },
                        },
                        {
                          id: "fcd_1",
                          type: "AgencyText",
                          props: {
                            variant: "body-md",
                            color: "body",
                            children:
                              "Algorithmic bidding and high-velocity creative testing across Search and Social ecosystems.",
                          },
                        },
                      ],
                    },
                    {
                      id: "fc_2",
                      type: "AgencyBox",
                      props: {
                        bg: "surface-card",
                        radius: "lg",
                        border: true,
                        padding: "md",
                        className: "flex flex-col gap-4 h-full",
                      },
                      children: [
                        {
                          id: "fci_2",
                          type: "AgencyBox",
                          props: {
                            bg: "canvas",
                            radius: "full",
                            border: true,
                            padding: "none",
                            className:
                              "w-10 h-10 flex items-center justify-center shrink-0",
                          },
                          children: [
                            {
                              id: "fci_icon2",
                              type: "AgencyIcon",
                              props: { name: "MousePointerClick", size: 20 },
                            },
                          ],
                        },
                        {
                          id: "fct_2",
                          type: "AgencyText",
                          props: {
                            variant: "title-lg",
                            color: "ink",
                            children: "Conversion Ops",
                          },
                        },
                        {
                          id: "fcd_2",
                          type: "AgencyText",
                          props: {
                            variant: "body-md",
                            color: "body",
                            children:
                              "Iterative landing page experiments driven by heatmaps, session recordings, and statistical significance.",
                          },
                        },
                      ],
                    },
                    {
                      id: "fc_3",
                      type: "AgencyBox",
                      props: {
                        bg: "surface-card",
                        radius: "lg",
                        border: true,
                        padding: "md",
                        className: "flex flex-col gap-4 h-full",
                      },
                      children: [
                        {
                          id: "fci_3",
                          type: "AgencyBox",
                          props: {
                            bg: "canvas",
                            radius: "full",
                            border: true,
                            padding: "none",
                            className:
                              "w-10 h-10 flex items-center justify-center shrink-0",
                          },
                          children: [
                            {
                              id: "fci_icon3",
                              type: "AgencyIcon",
                              props: { name: "LineChart", size: 20 },
                            },
                          ],
                        },
                        {
                          id: "fct_3",
                          type: "AgencyText",
                          props: {
                            variant: "title-lg",
                            color: "ink",
                            children: "Data & Attribution",
                          },
                        },
                        {
                          id: "fcd_3",
                          type: "AgencyText",
                          props: {
                            variant: "body-md",
                            color: "body",
                            children:
                              "Server-side tracking and multi-touch attribution modeling to reveal true customer acquisition costs.",
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },

        // --- DARK MOCKUP SECTION ---
        {
          id: "dark_section",
          type: "AgencySection",
          props: { bg: "canvas", padding: "md" },
          children: [
            {
              id: "dark_box",
              type: "AgencyBox",
              props: {
                bg: "surface-dark",
                radius: "xl",
                padding: "lg",
                className:
                  "flex flex-col lg:flex-row gap-10 lg:gap-12 items-center overflow-hidden",
              },
              children: [
                {
                  id: "dark_left",
                  type: "AgencyCodeWindow",
                  props: {
                    className: "flex-1 order-2 lg:order-1 w-full min-w-0",
                  },
                },
                {
                  id: "dark_right",
                  type: "AgencyFlex",
                  props: {
                    direction: "column",
                    gap: "md",
                    className: "flex-1 order-1 lg:order-2 w-full",
                  },
                  children: [
                    {
                      id: "dt_1",
                      type: "AgencyText",
                      props: {
                        variant: "display-md",
                        color: "on-dark",
                        children: "Your data, stripped of the noise.",
                      },
                    },
                    {
                      id: "dt_2",
                      type: "AgencyText",
                      props: {
                        variant: "body-lg",
                        color: "on-dark-soft",
                        children:
                          "We don't just run ads. We deploy proprietary attribution models that ingest omnichannel streams to show you exactly which touchpoints drive revenue, not just clicks.",
                      },
                    },
                    {
                      id: "db_wrapper",
                      type: "AgencyBox",
                      props: { className: "mt-2 md:mt-4" },
                      children: [
                        {
                          id: "db_1",
                          type: "AgencyButton",
                          props: {
                            variant: "dark-outline",
                            children: "Read the Documentation",
                            endIcon: "ArrowRight",
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },

        // --- CORAL CALLOUT ---
        {
          id: "callout_section",
          type: "AgencySection",
          props: { bg: "canvas", padding: "md" },
          children: [
            {
              id: "callout_box",
              type: "AgencyBox",
              props: {
                bg: "primary",
                radius: "xl",
                padding: "lg",
                className:
                  "flex flex-col items-center text-center gap-6 md:gap-8",
              },
              children: [
                {
                  id: "co_text",
                  type: "AgencyText",
                  props: {
                    variant: "display-sm",
                    color: "on-primary",
                    className: "max-w-2xl",
                    children: "Ready to scale your digital presence?",
                  },
                },
                {
                  id: "co_btn",
                  type: "AgencyButton",
                  props: {
                    variant: "white",
                    children: "Book a Strategy Session",
                  },
                },
              ],
            },
          ],
        },

        // --- FOOTER ---
        {
          id: "footer_section",
          type: "AgencySection",
          props: { bg: "surface-dark", padding: "lg" },
          children: [
            {
              id: "footer_flex",
              type: "AgencyFlex",
              props: { direction: "column", gap: "xl" },
              children: [
                {
                  id: "footer_top",
                  type: "AgencyGrid",
                  props: { cols: "responsive-4", gap: "lg" },
                  children: [
                    {
                      id: "ft_col1",
                      type: "AgencyFlex",
                      props: {
                        direction: "column",
                        gap: "sm",
                        className: "col-span-1 sm:col-span-2",
                      },
                      children: [
                        {
                          id: "ft_logo_row",
                          type: "AgencyFlex",
                          props: {
                            direction: "row",
                            align: "center",
                            gap: "xs",
                          },
                          children: [
                            {
                              id: "ft_icon",
                              type: "AgencyIcon",
                              props: {
                                name: "Sparkles",
                                color: "on-dark",
                                size: 20,
                              },
                            },
                            {
                              id: "ft_title",
                              type: "AgencyText",
                              props: {
                                variant: "nav-brand",
                                color: "on-dark",
                                children: "Vantage",
                              },
                            },
                          ],
                        },
                        {
                          id: "ft_desc",
                          type: "AgencyText",
                          props: {
                            variant: "body-sm",
                            color: "on-dark-soft",
                            className: "max-w-sm",
                            children:
                              "A performance marketing agency combining rigorous data science with editorial creative to drive asymmetrical growth.",
                          },
                        },
                      ],
                    },
                    {
                      id: "ft_col2",
                      type: "AgencyFlex",
                      props: { direction: "column", gap: "sm" },
                      children: [
                        {
                          id: "ft_c2_t",
                          type: "AgencyText",
                          props: {
                            variant: "nav-link",
                            color: "on-dark",
                            className: "mb-2 font-semibold",
                            children: "Services",
                          },
                        },
                        {
                          id: "ft_c2_l1",
                          type: "AgencyText",
                          props: {
                            variant: "nav-link",
                            color: "on-dark-soft",
                            className:
                              "cursor-pointer hover:text-[var(--color-on-dark)] transition-colors",
                            children: "Paid Acquisition",
                          },
                        },
                        {
                          id: "ft_c2_l2",
                          type: "AgencyText",
                          props: {
                            variant: "nav-link",
                            color: "on-dark-soft",
                            className:
                              "cursor-pointer hover:text-[var(--color-on-dark)] transition-colors",
                            children: "SEO & Content",
                          },
                        },
                        {
                          id: "ft_c2_l3",
                          type: "AgencyText",
                          props: {
                            variant: "nav-link",
                            color: "on-dark-soft",
                            className:
                              "cursor-pointer hover:text-[var(--color-on-dark)] transition-colors",
                            children: "Conversion Ops",
                          },
                        },
                      ],
                    },
                    {
                      id: "ft_col3",
                      type: "AgencyFlex",
                      props: { direction: "column", gap: "sm" },
                      children: [
                        {
                          id: "ft_c3_t",
                          type: "AgencyText",
                          props: {
                            variant: "nav-link",
                            color: "on-dark",
                            className: "mb-2 font-semibold",
                            children: "Agency",
                          },
                        },
                        {
                          id: "ft_c3_l1",
                          type: "AgencyText",
                          props: {
                            variant: "nav-link",
                            color: "on-dark-soft",
                            className:
                              "cursor-pointer hover:text-[var(--color-on-dark)] transition-colors",
                            children: "About",
                          },
                        },
                        {
                          id: "ft_c3_l2",
                          type: "AgencyText",
                          props: {
                            variant: "nav-link",
                            color: "on-dark-soft",
                            className:
                              "cursor-pointer hover:text-[var(--color-on-dark)] transition-colors",
                            children: "Careers",
                          },
                        },
                        {
                          id: "ft_c3_l3",
                          type: "AgencyText",
                          props: {
                            variant: "nav-link",
                            color: "on-dark-soft",
                            className:
                              "cursor-pointer hover:text-[var(--color-on-dark)] transition-colors",
                            children: "Contact",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  id: "footer_bottom",
                  type: "AgencyFlex",
                  props: {
                    direction: "responsive",
                    justify: "between",
                    align: "center",
                    gap: "sm",
                    className: "w-full border-t border-[#3d3d3a] pt-8",
                  },
                  children: [
                    {
                      id: "fb_copy",
                      type: "AgencyText",
                      props: {
                        variant: "body-sm",
                        color: "muted-soft",
                        children: "© 2026 Vantage. All rights reserved.",
                      },
                    },
                    {
                      id: "fb_links",
                      type: "AgencyFlex",
                      props: { direction: "row", gap: "md" },
                      children: [
                        {
                          id: "fb_l1",
                          type: "AgencyText",
                          props: {
                            variant: "body-sm",
                            color: "muted-soft",
                            className:
                              "cursor-pointer hover:text-[var(--color-on-dark)]",
                            children: "Privacy",
                          },
                        },
                        {
                          id: "fb_l2",
                          type: "AgencyText",
                          props: {
                            variant: "body-sm",
                            color: "muted-soft",
                            className:
                              "cursor-pointer hover:text-[var(--color-on-dark)]",
                            children: "Terms",
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ============================================================================
// STORY RENDERER WITH TANSTACK ROUTER
// ============================================================================
export const BuilderMode: Story = {
  name: "Vantage Agency Builder (Structured Controls)",
  render: function StoryRenderer() {
    const [isEditing, setIsEditing] = useState(false);

    const router = useMemo(() => {
      const history = createHashHistory({ window: window });

      const RootComponent = () => {
        const navigate = useNavigate({ strict: false });

        useEffect(() => {
          const handleNav = (e: any) => {
            const { linkTo, newTab } = e.detail;
            if (newTab) {
              window.open(linkTo, "_blank");
            } else {
              navigate({ to: linkTo });
            }
          };
          document.addEventListener("studio-navigate", handleNav);
          return () =>
            document.removeEventListener("studio-navigate", handleNav);
        }, [navigate]);

        return (
          <div className="w-full h-full relative group/site">
            {isEditing ? (
              <WebsiteStudio.Builder
                components={agencyRegistry}
                initialState={agencyWebsiteSchema}
                designSystem={agencyDesignSystem}
                globalHeadCode={customHeadCode}
                onExit={() => setIsEditing(false)}
                topBarCenter={
                  <div className="text-sm font-semibold text-on-surface">
                    Vantage Agency UI
                  </div>
                }
              />
            ) : (
              <>
                <div className="w-full min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
                  <WebsiteStudio.Renderer
                    components={agencyRegistry}
                    data={agencyWebsiteSchema.pages[0].content}
                    designSystem={agencyDesignSystem}
                    globalHeadCode={customHeadCode}
                  />
                  <div className="fixed bottom-8 right-8 z-[9999] opacity-0 group-hover/site:translate-y-0 group-hover/site:opacity-100 transition-all duration-300">
                    <button
                      className="bg-[#cc785c] text-white px-6 py-3 rounded-full font-medium shadow-2xl flex items-center gap-2 hover:bg-[#a9583e] transition-colors cursor-pointer"
                      onClick={() => setIsEditing(true)}
                    >
                      <Settings size={18} />
                      Edit Website Design
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      };

      const rootRoute = createRootRoute({ component: RootComponent });

      const routes = agencyWebsiteSchema.pages.map((page) =>
        createRoute({
          getParentRoute: () => rootRoute,
          path: page.slug,
          component: () => (
            <WebsiteStudio.Renderer
              components={agencyRegistry}
              data={page.content}
              designSystem={agencyDesignSystem}
              globalHeadCode={customHeadCode}
            />
          ),
        }),
      );

      const routeTree = rootRoute.addChildren(routes);
      return createRouter({ routeTree, history });
    }, [isEditing]);

    return (
      <div className="w-full h-screen relative">
        <RouterProvider router={router} />
      </div>
    );
  },
};
