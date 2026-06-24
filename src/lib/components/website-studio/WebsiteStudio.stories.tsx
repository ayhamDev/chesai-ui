import type { Meta, StoryObj } from "@storybook/react";
import { clsx } from "clsx";
import { BarChart2, Edit3, Globe, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { WebsiteStudio } from "./index";
import type { ComponentRegistry, WebsiteSchema } from "./types";

// --- TanStack Router Imports ---
import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  useNavigate,
} from "@tanstack/react-router";

// --- Chesai UI Component Imports ---
import {
  Accessibility,
  ArrowRight,
  Github,
  Palette,
  Sparkles,
  Zap,
} from "lucide-react";
import { AppBar } from "../appbar";
import { Button } from "../button";
import { Card } from "../card";
import { CodeEditor } from "../code-editor";
import { IconButton } from "../icon-button";
import { Input } from "../input";
import { InstallCommand } from "../install-command";
import { Flex } from "../layouts/flex";
import { Grid, GridItem } from "../layouts/grid";
import { toast, Toaster } from "../toast";
import { Typography } from "../typography";

const meta: Meta<typeof WebsiteStudio.Renderer> = {
  title: "Website Studio/1.Chesai UI Landing Page",
  component: WebsiteStudio.Renderer,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof WebsiteStudio.Renderer>;

// ============================================================================
// THE UPGRADED COMPONENT REGISTRY (Developer's UI Library)
// ============================================================================
const chesaiRegistry: ComponentRegistry = {
  InstallCommand: {
    name: "Install Command",
    category: "Elements",
    render: ({ packageName, variant, shape, shadow, className, ...props }) => (
      <div
        className={clsx("w-full max-w-2xl mx-auto mt-8", className)}
        {...props}
      >
        <InstallCommand
          packageName={packageName}
          variant={variant}
          shape={shape}
          shadow={shadow}
        />
      </div>
    ),
    controls: {
      packageName: {
        type: "text",
        label: "Package Name",
        defaultValue: "chesai-ui",
        group: "Package Information",
        supportsCMS: true,
      },
      variant: {
        type: "select",
        label: "Variant",
        group: "Aesthetics",
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
        group: "Aesthetics",
        options: [
          { label: "Full", value: "full" },
          { label: "Minimal", value: "minimal" },
          { label: "Sharp", value: "sharp" },
        ],
      },
      shadow: {
        type: "select",
        label: "Shadow",
        group: "Aesthetics",
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
    acceptsChildren: true,
    render: ({
      children,
      bg,
      padding = "80px 24px",
      align = "center",
      className,
      ...props
    }) => (
      <section
        style={{ backgroundColor: bg, padding }}
        className={clsx(`w-full flex flex-col items-${align}`, className)}
        {...props}
      >
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
          {children}
        </div>
      </section>
    ),
    controls: {
      bg: {
        type: "color",
        label: "Background Color",
        group: "Background Settings",
        hidden: true,
      },
      padding: {
        type: "custom",
        label: "Spacing Padding",
        group: "Layout Geometry",
        render: ({ value, onChange }) => {
          const vals = (value || "0px").split(" ").filter(Boolean);
          const t = vals[0] || "0px";
          const r = vals[1] || t;
          const b = vals[2] || t;
          const l = vals[3] || r;

          const handleUpdate = (pos: "t" | "r" | "b" | "l", val: string) => {
            const newT = pos === "t" ? val : t;
            const newR = pos === "r" ? val : r;
            const newB = pos === "b" ? val : b;
            const newL = pos === "l" ? val : l;

            if (newT === newB && newR === newL) {
              onChange(`${newT} ${newR}`);
            } else {
              onChange(`${newT} ${newR} ${newB} ${newL}`);
            }
          };

          return (
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Input
                size="sm"
                variant="filled"
                shape="minimal"
                placeholder="Top"
                value={t}
                onValueChange={(v) => handleUpdate("t", v)}
                startContent={
                  <span className="text-[10px] opacity-50 font-mono w-4">
                    T
                  </span>
                }
              />
              <Input
                size="sm"
                variant="filled"
                shape="minimal"
                placeholder="Right"
                value={r}
                onValueChange={(v) => handleUpdate("r", v)}
                startContent={
                  <span className="text-[10px] opacity-50 font-mono w-4">
                    R
                  </span>
                }
              />
              <Input
                size="sm"
                variant="filled"
                shape="minimal"
                placeholder="Bottom"
                value={b}
                onValueChange={(v) => handleUpdate("b", v)}
                startContent={
                  <span className="text-[10px] opacity-50 font-mono w-4">
                    B
                  </span>
                }
              />
              <Input
                size="sm"
                variant="filled"
                shape="minimal"
                placeholder="Left"
                value={l}
                onValueChange={(v) => handleUpdate("l", v)}
                startContent={
                  <span className="text-[10px] opacity-50 font-mono w-4">
                    L
                  </span>
                }
              />
            </div>
          );
        },
      },
      align: {
        type: "select",
        label: "Children Alignment",
        group: "Layout Geometry",
        options: [
          { label: "Left", value: "start" },
          { label: "Center", value: "center" },
          { label: "Right", value: "end" },
        ],
      },
    },
  },
  FlexBox: {
    name: "Flex Box",
    category: "Layout",
    acceptsChildren: true,
    render: (props) => <Flex {...props} />,
    controls: {
      direction: {
        type: "select",
        label: "Direction",
        group: "Flex Properties",
        options: [
          { label: "Row", value: "row" },
          { label: "Column", value: "column" },
        ],
      },
      gap: {
        type: "select",
        label: "Gap Size",
        group: "Flex Properties",
        options: [
          { label: "SM", value: "sm" },
          { label: "MD", value: "md" },
          { label: "LG", value: "lg" },
        ],
      },
      align: {
        type: "select",
        label: "Align Items",
        group: "Flex Properties",
        options: [
          { label: "Start", value: "start" },
          { label: "Center", value: "center" },
        ],
      },
      justify: {
        type: "select",
        label: "Justify Content",
        group: "Flex Properties",
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
    acceptsChildren: true,
    render: (props) => <Grid {...props} />,
    controls: {
      gap: {
        type: "select",
        label: "Gap",
        group: "Grid Settings",
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
    acceptsChildren: true,
    render: (props) => <GridItem {...props} />,
    controls: {},
  },
  Text: {
    name: "Text",
    category: "Typography",
    // ---> Added `whitespace-pre-wrap` so HTML renders \n as line breaks! <---
    render: ({ children, className, ...props }) => (
      <Typography
        {...props}
        className={clsx("whitespace-pre-wrap", className)}
        data-studio-editable="children"
      >
        {children}
      </Typography>
    ),
    controls: {
      children: {
        type: "textarea",
        label: "Content",
        group: "Content Data",
        supportsCMS: true,
      },
      variant: {
        type: "select",
        label: "Typographic Style",
        group: "Aesthetics",
        options: [
          { label: "Display Large", value: "display-large" },
          { label: "Headline Medium", value: "headline-medium" },
          { label: "Body Large", value: "body-large" },
          { label: "Label Large", value: "label-large" },
        ],
      },
      muted: {
        type: "boolean",
        label: "Muted Color",
        group: "Aesthetics",
      },
    },
  },
  CodeBlock: {
    name: "Code Block",
    category: "Elements",
    render: ({ code, language, fileName, className, ...props }) => (
      <div
        className={clsx(
          "w-full max-w-2xl mx-auto mt-2 text-left shadow-lg rounded-xl overflow-hidden",
          className,
        )}
        {...props}
      >
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
      code: {
        type: "textarea",
        label: "Code Content",
        group: "Code Definition",
        supportsCMS: true,
      },
      language: {
        type: "text",
        label: "Language Mode",
        defaultValue: "typescript",
        group: "Code Configuration",
      },
      fileName: {
        type: "text",
        label: "Tab Filename",
        defaultValue: "App.tsx",
        group: "Code Configuration",
      },
    },
  },
  Button: {
    name: "Button",
    category: "Elements",
    render: ({
      text,
      variant,
      size,
      shape,
      startIcon,
      linkTo,
      newTab,
      onClick,
      ...props
    }) => {
      const IconMap: any = { ArrowRight, Github };
      const IconComponent =
        startIcon && IconMap[startIcon] ? IconMap[startIcon] : null;

      const handleClick = (e: React.MouseEvent) => {
        if (onClick) onClick(e);
        if (linkTo && !e.defaultPrevented) {
          e.preventDefault();
          e.currentTarget.dispatchEvent(
            new CustomEvent("studio-navigate", {
              detail: { linkTo, newTab },
              bubbles: true,
            }),
          );
        }
      };

      return (
        <Button
          variant={variant}
          size={size}
          shape={shape}
          startIcon={IconComponent ? <IconComponent size={18} /> : undefined}
          onClick={handleClick}
          {...props}
        >
          <span data-studio-editable="text">{text}</span>
        </Button>
      );
    },
    controls: {
      text: {
        type: "text",
        label: "Label Text",
        group: "General Settings",
        supportsCMS: true,
      },
      variant: {
        type: "select",
        label: "Visual Variant",
        group: "Aesthetics",
        options: [
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
          { label: "Outline", value: "outline" },
        ],
      },
      linkTo: {
        type: "link",
        label: "Link To",
        group: "Behavior Options",
        supportsCMS: true,
      },
      newTab: {
        type: "boolean",
        label: "Open in new tab",
        group: "Behavior Options",
        hidden: (props) => !props.linkTo || props.linkTo.trim() === "",
      },
    },
  },
  AnnouncementBadge: {
    name: "Announcement Badge",
    category: "Elements",
    render: ({ text, className, ...props }) => (
      <div
        className={clsx(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container/50 border border-secondary-container text-on-secondary-container text-sm font-medium w-fit mx-auto shadow-sm backdrop-blur-md",
          className,
        )}
        {...props}
      >
        <Sparkles size={14} className="text-primary shrink-0" />
        <span data-studio-editable="text">{text}</span>
      </div>
    ),
    controls: {
      text: {
        type: "text",
        label: "Text",
        group: "General Settings",
        supportsCMS: true,
      },
    },
  },
  NavigationBlock: {
    name: "Navigation Bar",
    category: "Blocks",
    render: ({ title, className, ...props }) => (
      <AppBar
        className={clsx("container mx-auto", className)}
        variant="small"
        color="transparent"
        title={
          <span
            className="font-bold tracking-tight"
            data-studio-editable="title"
          >
            {title}
          </span>
        }
        trailingIcons={
          <Button variant="ghost" size="sm" startIcon={<Github size={18} />}>
            Repository
          </Button>
        }
        {...props}
      />
    ),
    controls: {
      title: {
        type: "text",
        label: "Brand Name",
        group: "General Settings",
        supportsCMS: true,
      },
    },
  },
  FeatureCard: {
    name: "Feature Card",
    category: "Blocks",
    render: ({ title, description, icon, className, ...props }) => {
      const IconMap: any = { Zap, Accessibility, Palette };
      const IconComponent = IconMap[icon] || Zap;
      return (
        <Card
          variant="surface-container-low"
          shape="minimal"
          padding="lg"
          hoverEffect
          className={clsx(
            "h-full flex flex-col gap-4 border border-outline-variant/30",
            className,
          )}
          {...props}
        >
          <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
            <IconComponent size={24} />
          </div>
          <Typography
            variant="title-large"
            className="font-bold mt-2"
            data-studio-editable="title"
          >
            {title}
          </Typography>
          {/* ---> Added `whitespace-pre-wrap` here as well <--- */}
          <Typography
            variant="body-medium"
            muted
            className="leading-relaxed whitespace-pre-wrap"
            data-studio-editable="description"
          >
            {description}
          </Typography>
        </Card>
      );
    },
    controls: {
      title: {
        type: "text",
        label: "Title",
        group: "General Settings",
        supportsCMS: true,
      },
      description: {
        type: "textarea",
        label: "Description text",
        group: "General Settings",
        supportsCMS: true,
      },
      icon: {
        type: "text",
        label: "Icon Name (Lucide)",
        group: "Aesthetics",
      },
    },
  },
};

// ============================================================================
// MOCK EXTERNAL DATA & API
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
  toast,
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
      title: "Home",
      content: [
        {
          id: "nav",
          type: "NavigationBlock",
          props: { title: "chesai-ui" },
          events: {
            onClick: [
              {
                actionId: "openLink",
                args: ["https://github.com/ayhamdev/chesai-ui", "_blank"],
              },
            ],
          },
        },
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
                        linkTo: "/about",
                        newTab: false,
                      },
                      events: {
                        onClick: [
                          {
                            actionId: "logToConsole",
                            args: ["Primary CTA Clicked!"],
                          },
                          {
                            actionId: "$customCode",
                            code: `
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
      ],
    },
    {
      id: "page_about",
      slug: "/about",
      title: "About Us",
      content: [
        {
          id: "nav_about",
          type: "NavigationBlock",
          props: { title: "chesai-ui // about" },
        },
        {
          id: "about_hero",
          type: "Section",
          props: { padding: "160px 24px", align: "center" },
          children: [
            {
              id: "about_title",
              type: "Text",
              props: {
                variant: "display-large",
                className: "font-extrabold tracking-tight text-primary",
                children: "Mocked Page Route",
              },
            },
            {
              id: "about_subtitle",
              type: "Text",
              props: {
                variant: "body-large",
                muted: true,
                className: "mt-4 max-w-xl text-center",
                children:
                  "Notice how the Studio Engine seamlessly navigates here without a full page reload, reading the secondary page data directly from the JSON schema.",
              },
            },
            {
              id: "about_back_btn",
              type: "Button",
              props: {
                text: "Go Back Home",
                variant: "secondary",
                size: "lg",
                shape: "full",
                linkTo: "/",
                newTab: false,
                className: "mt-8",
              },
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

export const VisualBuilderMode: Story = {
  name: "Website Studio Builder (Canvas)",
  parameters: {
    docs: {
      description: {
        story:
          "Advanced dynamic properties with CMS mappings, auto-complete Suggestion links, Custom Property Fields, TanStack Router integration, and Precision Inline Text Editing.",
      },
    },
  },
  render: function StoryRenderer() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isEditing, setIsEditing] = useState(false);

    // eslint-disable-next-line react-hooks/rules-of-hooks
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
          <div className="w-full bg-background text-on-background min-h-screen relative group/site">
            <Toaster />
            {isEditing ? (
              <WebsiteStudio.Builder
                components={chesaiRegistry}
                initialState={landingPageJSON}
                cms={mockCMSData}
                actions={mockCustomActions}
                customApi={mockCustomAPI}
                onExit={() => setIsEditing(false)}
                topBarLeft={<div className="flex items-center gap-1"></div>}
                topBarCenter={
                  <>
                    <Typography
                      variant="label-medium"
                      className="font-bold text-on-surface tracking-wide"
                    >
                      {landingPageJSON.projectSettings.name}
                    </Typography>
                    <span className="text-on-surface-variant opacity-40 text-sm">
                      &middot;
                    </span>
                    <Typography
                      variant="body-small"
                      className="text-on-surface-variant opacity-80"
                    >
                      draft.framer.app
                    </Typography>
                  </>
                }
                topBarRight={
                  <>
                    <div className="flex items-center gap-1 border-l border-outline-variant/30 pl-4 pr-2">
                      <IconButton
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 text-on-surface-variant hover:text-on-surface"
                      >
                        <Globe size={16} />
                      </IconButton>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 text-on-surface-variant hover:text-on-surface"
                      >
                        <Settings size={16} />
                      </IconButton>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 text-on-surface-variant hover:text-on-surface"
                      >
                        <BarChart2 size={16} />
                      </IconButton>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      className="h-8 px-5 font-bold shadow-none"
                    >
                      Publish
                    </Button>
                  </>
                }
              />
            ) : (
              <>
                <Outlet />
                <div className="fixed bottom-8 right-8 z-[9999] opacity-0 group-hover/site:translate-y-0 group-hover/site:opacity-100 transition-all duration-300">
                  <Button
                    size="lg"
                    variant="primary"
                    className="shadow-2xl font-bold"
                    startIcon={<Edit3 size={18} />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit in Website Studio
                  </Button>
                </div>
              </>
            )}
          </div>
        );
      };

      const rootRoute = createRootRoute({ component: RootComponent });

      const routes = landingPageJSON.pages.map((page) =>
        createRoute({
          getParentRoute: () => rootRoute,
          path: page.slug,
          component: () => (
            <WebsiteStudio.Renderer
              components={chesaiRegistry}
              data={page.content}
              cms={mockCMSData}
              actions={mockCustomActions}
              customApi={mockCustomAPI}
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
