import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { WebsiteStudio } from "./index";
import type { ComponentRegistry, WebsiteSchema } from "./types";

// --- Chesai UI Component Imports ---
import {
  Accessibility,
  ArrowRight,
  Github,
  Palette,
  Sparkles,
  Zap,
} from "lucide-react";
import { ThemeProvider } from "../../context/ThemeProvider";
import { AppBar } from "../appbar";
import { Button } from "../button";
import { Card } from "../card";
import { CodeEditor } from "../code-editor";
import { InstallCommand } from "../install-command";
import { Flex } from "../layout/flex";
import { Grid, GridItem } from "../layout/grid";
import { toast, Toaster } from "../toast";
import { Typography } from "../typography";

const meta: Meta<typeof WebsiteStudio.Renderer> = {
  title: "Website Studio/Chesai UI Landing Page",
  component: WebsiteStudio.Renderer,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof WebsiteStudio.Renderer>;

// ============================================================================
// THE COMPONENT REGISTRY (Developer's UI Library)
// ============================================================================
const chesaiRegistry: ComponentRegistry = {
  InstallCommand: {
    name: "Install Command",
    category: "Elements",
    render: (props) => (
      <div className="w-full max-w-2xl mx-auto mt-8">
        <InstallCommand {...props} />
      </div>
    ),
    controls: {
      packageName: {
        type: "text",
        label: "Package Name",
        defaultValue: "chesai-ui",
      },
      variant: {
        type: "select",
        label: "Variant",
        options: [
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
          { label: "Surface", value: "surface" },
          { label: "Ghost", value: "ghost" },
        ],
      },
      shape: {
        type: "select",
        label: "Shape",
        options: [
          { label: "Full", value: "full" },
          { label: "Minimal", value: "minimal" },
          { label: "Sharp", value: "sharp" },
        ],
      },
      shadow: {
        type: "select",
        label: "Shadow",
        options: [
          { label: "None", value: "none" },
          { label: "Small", value: "sm" },
          { label: "Medium", value: "md" },
          { label: "Large", value: "lg" },
        ],
      },
    },
  },
  Section: {
    name: "Section",
    category: "Layout",
    render: ({ children, bg, padding = "80px 24px", align = "center" }) => (
      <section
        style={{ backgroundColor: bg, padding }}
        className={`w-full flex flex-col items-${align}`}
      >
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
          {children}
        </div>
      </section>
    ),
    controls: {
      bg: { type: "color", label: "Background Color" },
      padding: { type: "text", label: "Padding" },
    },
  },
  FlexBox: {
    name: "Flex Box",
    category: "Layout",
    render: (props) => <Flex {...props} />,
    controls: {
      direction: {
        type: "select",
        label: "Direction",
        options: [
          { label: "Row", value: "row" },
          { label: "Column", value: "column" },
        ],
      },
      gap: {
        type: "select",
        label: "Gap",
        options: [
          { label: "SM", value: "sm" },
          { label: "MD", value: "md" },
          { label: "LG", value: "lg" },
        ],
      },
      align: {
        type: "select",
        label: "Align",
        options: [
          { label: "Start", value: "start" },
          { label: "Center", value: "center" },
        ],
      },
      justify: {
        type: "select",
        label: "Justify",
        options: [
          { label: "Start", value: "start" },
          { label: "Center", value: "center" },
          { label: "Between", value: "between" },
        ],
      },
    },
  },
  GridBox: {
    name: "Grid Box",
    category: "Layout",
    render: (props) => <Grid {...props} />,
    controls: {
      gap: {
        type: "select",
        label: "Gap",
        options: [
          { label: "MD", value: "md" },
          { label: "LG", value: "lg" },
        ],
      },
    },
  },
  GridItemBox: {
    name: "Grid Item",
    category: "Layout",
    render: (props) => <GridItem {...props} />,
    controls: {},
  },
  Text: {
    name: "Text",
    category: "Typography",
    render: (props) => <Typography {...props} />,
    controls: {
      children: { type: "textarea", label: "Content" },
      variant: {
        type: "select",
        label: "Variant",
        options: [
          { label: "Display Large", value: "display-large" },
          { label: "Headline Medium", value: "headline-medium" },
          { label: "Body Large", value: "body-large" },
        ],
      },
      muted: { type: "boolean", label: "Muted" },
    },
  },
  CodeBlock: {
    name: "Code Block",
    category: "Elements",
    render: ({ code, language, fileName }) => (
      <div className="w-full max-w-2xl mx-auto mt-2 text-left shadow-lg rounded-xl overflow-hidden">
        <CodeEditor
          value={code}
          language={language || "typescript"}
          readOnly={true}
          fileName={fileName}
          height={250}
          variant="secondary"
          shape="minimal"
          toolbarSize="sm"
          enableCopy={true}
          disableContextMenu={true}
        />
      </div>
    ),
    controls: {
      code: { type: "textarea", label: "Code Content" },
      language: { type: "text", label: "Language", defaultValue: "typescript" },
      fileName: { type: "text", label: "File Name", defaultValue: "App.tsx" },
    },
  },
  Button: {
    name: "Button",
    category: "Elements",
    render: ({ text, variant, size, shape, startIcon, ...props }) => {
      const IconMap: any = { ArrowRight, Github };
      const IconComponent =
        startIcon && IconMap[startIcon] ? IconMap[startIcon] : null;
      return (
        <Button
          variant={variant}
          size={size}
          shape={shape}
          startIcon={IconComponent ? <IconComponent size={18} /> : undefined}
          {...props}
        >
          {text}
        </Button>
      );
    },
    controls: {
      text: { type: "text", label: "Label" },
      variant: {
        type: "select",
        label: "Variant",
        options: [
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
          { label: "Outline", value: "outline" },
        ],
      },
    },
  },
  AnnouncementBadge: {
    name: "Announcement Badge",
    category: "Elements",
    render: ({ text }) => (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container/50 border border-secondary-container text-on-secondary-container text-sm font-medium w-fit mx-auto shadow-sm backdrop-blur-md">
        <Sparkles size={14} className="text-primary" />
        {text}
      </div>
    ),
    controls: { text: { type: "text", label: "Text" } },
  },
  NavigationBlock: {
    name: "Navigation Bar",
    category: "Blocks",
    render: ({ title, ...props }) => (
      <AppBar
        className="container mx-auto"
        variant="small"
        color="transparent"
        title={<span className="font-bold tracking-tight">{title}</span>}
        trailingIcons={
          <Button
            variant="ghost"
            size="sm"
            startIcon={<Github size={18} />}
            {...props}
          >
            Repository
          </Button>
        }
      />
    ),
    controls: { title: { type: "text", label: "Brand Name" } },
  },
  FeatureCard: {
    name: "Feature Card",
    category: "Blocks",
    render: ({ title, description, icon }) => {
      const IconMap: any = { Zap, Accessibility, Palette };
      const IconComponent = IconMap[icon] || Zap;
      return (
        <Card
          variant="surface-container-low"
          shape="minimal"
          padding="lg"
          hoverEffect
          className="h-full flex flex-col gap-4 border border-outline-variant/30"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
            <IconComponent size={24} />
          </div>
          <Typography variant="title-large" className="font-bold mt-2">
            {title}
          </Typography>
          <Typography variant="body-medium" muted className="leading-relaxed">
            {description}
          </Typography>
        </Card>
      );
    },
    controls: {
      title: { type: "text", label: "Title" },
      description: { type: "textarea", label: "Description" },
      icon: { type: "text", label: "Icon Name (Lucide)" },
    },
  },
};

// ============================================================================
// MOCK EXTERNAL DATA & API (For Event Bindings & Interpolation)
// ============================================================================

const mockCMSData = {
  hero: {
    badge: "New: Render Engine v2 with CMS Bindings",
    headline: "Build beautiful interfaces, instantly.",
    subheading:
      "A modern, accessible, and highly customizable React component library featuring 100% agnostic data injection.",
    ctaPrimary: "Start Building",
    ctaSecondary: "Read Docs",
  },
  features: {
    label: "Features",
    title: "Everything you need to ship faster.",
  },
};

const mockCustomActions = {
  logToConsole: (msg: string) => {
    console.log(`[Studio Action Fired]: ${msg}`);
  },
};

const mockCustomAPI = {
  toast, // Pass the Sonner toast instance directly into the isolated sandbox
};

// ============================================================================
// THE JSON SCHEMA (Database Payload)
// ============================================================================
const landingPageJSON: WebsiteSchema = {
  projectSettings: { name: "Chesai UI" },
  designSystem: { tokens: {} },
  pages: [
    {
      id: "page_home",
      slug: "/",
      title: "Chesai UI - Modern React Components",
      content: [
        // --- 1. NAVBAR ---
        {
          id: "nav",
          type: "NavigationBlock",
          props: { title: "chesai-ui" },
          events: {
            onClick: [
              {
                actionId: "openLink", // from defaultActions
                args: ["https://github.com/ayhamdev/chesai-ui", "_blank"],
              },
            ],
          },
        },

        // --- 2. HERO SECTION ---
        {
          id: "hero_section",
          type: "Section",
          props: { padding: "120px 24px", align: "center" },
          children: [
            {
              id: "hero_content",
              type: "FlexBox",
              props: {
                direction: "column",
                align: "center",
                gap: "lg",
                className: "text-center max-w-3xl mx-auto",
              },
              children: [
                {
                  id: "badge",
                  type: "AnnouncementBadge",
                  props: {
                    // CMS Interpolation binding!
                    text: "{{hero.badge}}",
                  },
                },
                {
                  id: "hero_title",
                  type: "Text",
                  props: {
                    variant: "display-large",
                    className:
                      "font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-on-background to-on-background/50 custom-underline",
                    // CMS Interpolation binding!
                    children: "{{hero.headline}}",
                  },
                },
                {
                  id: "hero_subtitle",
                  type: "Text",
                  props: {
                    variant: "body-large",
                    muted: true,
                    className: "text-lg md:text-xl leading-relaxed",
                    // CMS Interpolation binding!
                    children: "{{hero.subheading}}",
                  },
                },
                {
                  id: "hero_actions",
                  type: "FlexBox",
                  props: {
                    direction: "row",
                    gap: "md",
                    className: "mt-4 flex-wrap justify-center",
                  },
                  children: [
                    {
                      id: "btn_start",
                      type: "Button",
                      props: {
                        text: "{{hero.ctaPrimary}}",
                        variant: "primary",
                        size: "lg",
                        shape: "full",
                        startIcon: "ArrowRight",
                      },
                      events: {
                        onClick: [
                          {
                            actionId: "logToConsole",
                            args: ["Primary CTA Clicked!"],
                          },
                          {
                            // Advanced Sandbox Execution Example
                            actionId: "$customCode",
                            code: `
                              event.preventDefault();
                              api.toast.success("Sandbox Executed Successfully!", {
                                description: "Read CMS data: " + cms.hero.headline
                              });
                            `,
                          },
                        ],
                      },
                    },
                    {
                      id: "btn_docs",
                      type: "Button",
                      props: {
                        text: "{{hero.ctaSecondary}}",
                        variant: "secondary",
                        size: "lg",
                        shape: "full",
                      },
                      events: {
                        onClick: [
                          {
                            actionId: "openLink",
                            args: ["https://chesai-ui.pages.dev/", "_blank"],
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },

        // --- 3. FEATURES SECTION ---
        {
          id: "features_section",
          type: "Section",
          props: {
            padding: "80px 24px",
            bg: "var(--md-sys-color-surface-container-lowest)",
          },
          children: [
            {
              id: "features_header",
              type: "FlexBox",
              props: { direction: "column", gap: "sm", className: "mb-8" },
              children: [
                {
                  id: "feat_label",
                  type: "Text",
                  props: {
                    variant: "label-large",
                    className:
                      "text-primary uppercase tracking-widest font-bold",
                    children: "{{features.label}}",
                  },
                },
                {
                  id: "feat_title",
                  type: "Text",
                  props: {
                    variant: "headline-medium",
                    className: "font-bold",
                    children: "{{features.title}}",
                  },
                },
              ],
            },
            {
              id: "features_grid",
              type: "GridBox",
              props: { columns: { default: 1, md: 2, lg: 3 }, gap: "lg" },
              children: [
                {
                  id: "card_1",
                  type: "FeatureCard",
                  props: {
                    icon: "Accessibility",
                    title: "Accessible by Default",
                    description:
                      "Built on top of Radix UI primitives. Fully keyboard navigable and screen-reader optimized.",
                  },
                },
                {
                  id: "card_2",
                  type: "FeatureCard",
                  props: {
                    icon: "Zap",
                    title: "Fluid Animations",
                    description:
                      "Powered by Framer Motion. Physics-based layout transitions and micro-interactions baked in.",
                  },
                },
                {
                  id: "card_3",
                  type: "FeatureCard",
                  props: {
                    icon: "Palette",
                    title: "Material You Theming",
                    description:
                      "Dynamic color extraction and semantic surface hierarchy following Material Design 3.",
                  },
                },
              ],
            },
          ],
        },

        // --- 4. CTA / FOOTER SECTION ---
        {
          id: "cta_section",
          type: "Section",
          props: {
            padding: "100px 24px",
            align: "center",
            bg: "var(--md-sys-color-surface-container)",
          },
          children: [
            {
              id: "cta_content",
              type: "FlexBox",
              props: {
                direction: "column",
                align: "center",
                gap: "md",
                className: "text-center w-full",
              },
              children: [
                {
                  id: "cta_title",
                  type: "Text",
                  props: {
                    variant: "headline-large",
                    className: "font-bold",
                    children: "Ready to transform your workflow?",
                  },
                },
                {
                  id: "cta_sub",
                  type: "Text",
                  props: {
                    variant: "body-large",
                    muted: true,
                    children:
                      "Join developers building the next generation of web applications.",
                  },
                },
                {
                  id: "cta_terminal",
                  type: "InstallCommand",
                  props: {
                    packageName: "chesai-ui",
                    variant: "secondary",
                    shadow: "lg",
                  },
                },
                {
                  id: "cta_instructions_title",
                  type: "Text",
                  props: {
                    variant: "body-large",
                    className: "mt-12",
                    children:
                      "To use the components, import the core styles and wrap your app with the ChesaiProvider:",
                  },
                },
                {
                  id: "cta_code_snippet",
                  type: "CodeBlock",
                  props: {
                    code: "import 'chesai-ui/styles.css';\nimport { ChesaiProvider } from 'chesai-ui';\n\nexport default function App({ children }) {\n  return (\n    <ChesaiProvider>\n      {children}\n    </ChesaiProvider>\n  );\n}",
                    language: "typescript",
                    fileName: "App.tsx",
                  },
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
// MOCK GLOBAL HEAD INJECTION (To show styling bridge capabilities)
// ============================================================================
const injectedStyles = `
  <style>
    /* Injected via globalHeadCode */
    .custom-underline {
      text-decoration: underline;
      text-decoration-color: var(--md-sys-color-primary);
      text-decoration-thickness: 4px;
      text-underline-offset: 6px;
    }
  </style>
`;

// ============================================================================
// STORY RENDERER
// ============================================================================

export const AdvancedEngineSimulation: Story = {
  name: "Chesai UI Landing Page (with CMS & Interactivity)",
  render: () => (
    <div className="w-full bg-background text-on-background min-h-screen">
      <Toaster />
      <WebsiteStudio.Renderer
        components={chesaiRegistry}
        data={landingPageJSON.pages[0]}
        cms={mockCMSData}
        actions={mockCustomActions}
        customApi={mockCustomAPI}
        globalHeadCode={injectedStyles}
      />
    </div>
  ),
};
