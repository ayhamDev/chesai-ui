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
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

// Import ONLY the Studio Engine (No chesai-ui primitive components)
import { WebsiteStudio } from "../index";
import type { ComponentRegistry, WebsiteSchema } from "../types";

const meta: Meta<typeof WebsiteStudio.Renderer> = {
  title: "Website Studio/Digital Agency (Custom Design System)",
  component: WebsiteStudio.Renderer,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof WebsiteStudio.Renderer>;

// ============================================================================
// CUSTOM DESIGN SYSTEM COMPONENTS (Claude-analysis Specs)
// ============================================================================

const FontsStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
      @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap');
      .font-serif-display { font-family: 'EB Garamond', serif; }
      .font-sans-body { font-family: 'Inter', sans-serif; }
      .font-mono-code { font-family: 'JetBrains Mono', monospace; }
    `,
    }}
  />
);

const AgencyButton = ({
  variant = "primary",
  children,
  className,
  ...props
}: any) => {
  const isPrimary = variant === "primary";
  return (
    <button
      className={clsx(
        "font-sans-body text-[14px] font-medium rounded-[8px] h-[40px] px-[20px] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0",
        isPrimary
          ? "bg-[#cc785c] text-[#ffffff] hover:bg-[#a9583e]"
          : "bg-transparent border border-[#e6dfd8] text-[#141413] hover:bg-[#efe9de]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const SerifDisplay = ({
  level = 1,
  size = "xl",
  children,
  className,
  ...props
}: any) => {
  const Tag = `h${level}` as any;
  const sizeClasses = {
    xl: "text-[40px] md:text-[64px] leading-[1.1] md:leading-[1.05] tracking-[-1px] md:tracking-[-1.5px]",
    lg: "text-[32px] md:text-[48px] leading-[1.15] md:leading-[1.1] tracking-[-0.5px] md:tracking-[-1px]",
    md: "text-[28px] md:text-[36px] leading-[1.2] md:leading-[1.15] tracking-[-0.3px] md:tracking-[-0.5px]",
    sm: "text-[24px] md:text-[28px] leading-[1.25] md:leading-[1.2] tracking-[-0.3px]",
  }[size as string];

  return (
    <Tag
      className={clsx(
        "font-serif-display font-normal text-[#141413]",
        sizeClasses,
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};

// ============================================================================
// COMPONENT REGISTRY (With className Extraction Fixes)
// ============================================================================

const agencyRegistry: ComponentRegistry = {
  AgencyNav: {
    name: "Navigation",
    category: "Global",
    // FIX: Extract className so ...props doesn't obliterate the layout classes
    render: ({ brandName, ctaText, className, ...props }) => (
      <nav
        className={clsx(
          "w-full h-[64px] bg-[#faf9f5] flex items-center justify-between px-4 md:px-12 border-b border-[#e6dfd8] shrink-0",
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-2 shrink-0">
          <Sparkles className="w-5 h-5 text-[#141413]" strokeWidth={2.5} />
          <span
            className="font-sans-body font-semibold text-[#141413] text-[18px] tracking-tight"
            data-studio-editable="brandName"
          >
            {brandName}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-sans-body text-[14px] font-medium text-[#3d3d3a]">
          <span className="cursor-pointer hover:text-[#141413] transition-colors">
            Expertise
          </span>
          <span className="cursor-pointer hover:text-[#141413] transition-colors">
            Methodology
          </span>
          <span className="cursor-pointer hover:text-[#141413] transition-colors">
            Case Studies
          </span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="hidden sm:block font-sans-body text-[14px] font-medium text-[#141413] cursor-pointer hover:underline underline-offset-4 decoration-[#cc785c]">
            Sign In
          </span>
          <AgencyButton variant="primary">
            <span data-studio-editable="ctaText">{ctaText}</span>
          </AgencyButton>
        </div>
      </nav>
    ),
    controls: {
      brandName: { type: "text", label: "Brand Name" },
      ctaText: { type: "text", label: "CTA Button Text" },
    },
  },

  AgencyHero: {
    name: "Hero Band",
    category: "Sections",
    render: ({
      headline,
      subhead,
      primaryCta,
      secondaryCta,
      className,
      ...props
    }) => (
      <section
        className={clsx(
          "w-full bg-[#faf9f5] py-16 lg:py-[96px] px-4 md:px-12 overflow-hidden",
          className,
        )}
        {...props}
      >
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 flex flex-col gap-6 w-full max-w-2xl lg:max-w-none">
            <SerifDisplay size="xl" data-studio-editable="headline">
              {headline}
            </SerifDisplay>
            <p
              className="font-sans-body text-[16px] md:text-[18px] text-[#3d3d3a] leading-[1.55] max-w-xl"
              data-studio-editable="subhead"
            >
              {subhead}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <AgencyButton variant="primary">
                <span data-studio-editable="primaryCta">{primaryCta}</span>
              </AgencyButton>
              <AgencyButton variant="secondary">
                <span data-studio-editable="secondaryCta">{secondaryCta}</span>
              </AgencyButton>
            </div>
          </div>

          <div className="w-full lg:flex-1 bg-[#efe9de] rounded-[16px] min-h-[300px] md:min-h-[400px] border border-[#e6dfd8] flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
            <div className="absolute top-12 left-12 right-12 bottom-0 border-t border-l border-[#cc785c]/30">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,80 Q25,60 50,40 T100,10"
                  fill="none"
                  stroke="#cc785c"
                  strokeWidth="2"
                />
                <circle cx="50" cy="40" r="3" fill="#141413" />
                <circle cx="100" cy="10" r="3" fill="#141413" />
              </svg>
            </div>
            <div className="bg-[#faf9f5] border border-[#e6dfd8] p-5 md:p-6 rounded-[12px] shadow-sm z-10 w-[90%] md:w-3/4 max-w-sm transform translate-y-4 md:translate-y-8">
              <div className="font-sans-body text-[11px] md:text-[13px] font-medium text-[#8e8b82] uppercase tracking-[1.5px] mb-2">
                Q3 Conversion Growth
              </div>
              <SerifDisplay size="sm" level={3} className="mb-1">
                +248%
              </SerifDisplay>
              <div className="w-full bg-[#f5f0e8] h-2 rounded-full overflow-hidden mt-4">
                <div className="bg-[#cc785c] w-[75%] h-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>
    ),
    controls: {
      headline: { type: "textarea", label: "Headline" },
      subhead: { type: "textarea", label: "Subheading" },
      primaryCta: { type: "text", label: "Primary CTA" },
      secondaryCta: { type: "text", label: "Secondary CTA" },
    },
  },

  FeatureGrid: {
    name: "Feature Layout",
    category: "Layout",
    acceptsChildren: true,
    render: ({ children, sectionTitle, className, ...props }) => (
      <section
        className={clsx(
          "w-full bg-[#faf9f5] py-16 lg:py-[96px] px-4 md:px-12",
          className,
        )}
        {...props}
      >
        <div className="max-w-[1200px] mx-auto flex flex-col gap-10 md:gap-12">
          <SerifDisplay
            size="lg"
            level={2}
            className="text-center"
            data-studio-editable="sectionTitle"
          >
            {sectionTitle}
          </SerifDisplay>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {children}
          </div>
        </div>
      </section>
    ),
    controls: {
      sectionTitle: { type: "text", label: "Section Title" },
    },
  },

  FeatureCard: {
    name: "Feature Card",
    category: "Cards",
    render: ({ title, description, icon, className, ...props }) => {
      const IconMap: any = { LineChart, Megaphone, MousePointerClick };
      const IconComponent = IconMap[icon] || LineChart;

      return (
        <article
          className={clsx(
            "bg-[#efe9de] rounded-[12px] p-6 md:p-[32px] flex flex-col gap-4 border border-[#e6dfd8] h-full",
            className,
          )}
          {...props}
        >
          <div className="w-10 h-10 rounded-full bg-[#faf9f5] border border-[#e6dfd8] flex items-center justify-center text-[#141413] shrink-0">
            <IconComponent size={20} />
          </div>
          <h3
            className="font-sans-body text-[18px] font-semibold text-[#141413]"
            data-studio-editable="title"
          >
            {title}
          </h3>
          <p
            className="font-sans-body text-[15px] md:text-[16px] text-[#3d3d3a] leading-[1.55]"
            data-studio-editable="description"
          >
            {description}
          </p>
        </article>
      );
    },
    controls: {
      title: { type: "text", label: "Title" },
      description: { type: "textarea", label: "Description" },
      icon: {
        type: "select",
        label: "Icon",
        options: [
          { label: "Chart", value: "LineChart" },
          { label: "Megaphone", value: "Megaphone" },
          { label: "Click", value: "MousePointerClick" },
        ],
      },
    },
  },

  DarkProductMockup: {
    name: "Dark Tech Mockup",
    category: "Sections",
    render: ({ title, subtitle, codeSnippet, className, ...props }) => (
      <section
        className={clsx(
          "w-full bg-[#faf9f5] py-16 lg:py-[96px] px-4 md:px-12",
          className,
        )}
        {...props}
      >
        <div className="max-w-[1200px] mx-auto bg-[#181715] rounded-[16px] p-6 md:p-8 lg:p-[48px] flex flex-col lg:flex-row gap-10 lg:gap-12 items-center overflow-hidden">
          <div className="flex-1 flex flex-col gap-6 order-2 lg:order-1 w-full min-w-0">
            <div className="w-full bg-[#1f1e1b] border border-[#3d3d3a] rounded-[12px] overflow-hidden flex flex-col shadow-2xl">
              <div className="h-10 bg-[#252320] flex items-center px-4 gap-2 border-b border-[#3d3d3a] shrink-0">
                <div className="w-3 h-3 rounded-full bg-[#c64545]" />
                <div className="w-3 h-3 rounded-full bg-[#d4a017]" />
                <div className="w-3 h-3 rounded-full bg-[#5db872]" />
                <span className="ml-4 font-sans-body text-[12px] text-[#8e8b82] truncate">
                  attribution_engine.ts
                </span>
              </div>
              <div className="p-4 md:p-[24px] font-mono-code text-[12px] md:text-[14px] text-[#faf9f5] leading-[1.6] overflow-x-auto w-full whitespace-pre">
                <span className="text-[#cc785c]">import</span>{" "}
                {"{ Metrics, Tracker }"}{" "}
                <span className="text-[#cc785c]">from</span>{" "}
                <span className="text-[#5db8a6]">'@vantage/core'</span>;<br />
                <br />
                <span className="text-[#cc785c]">const</span> engine ={" "}
                <span className="text-[#cc785c]">new</span> Tracker(&#123;
                <br />
                &nbsp;&nbsp;mode:{" "}
                <span className="text-[#5db8a6]">'deterministic'</span>,<br />
                &nbsp;&nbsp;realtime:{" "}
                <span className="text-[#e8a55a]">true</span>,<br />
                &#125;);
                <br />
                <br />
                <span className="text-[#8e8b82]">
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
          </div>

          <div className="flex-1 flex flex-col gap-5 lg:gap-6 order-1 lg:order-2 w-full">
            <h2
              className="font-serif-display text-[28px] md:text-[36px] text-[#faf9f5] leading-[1.15] tracking-[-0.5px]"
              data-studio-editable="title"
            >
              {title}
            </h2>
            <p
              className="font-sans-body text-[15px] md:text-[16px] text-[#a09d96] leading-[1.55]"
              data-studio-editable="subtitle"
            >
              {subtitle}
            </p>
            <div className="mt-2 md:mt-4">
              <AgencyButton
                variant="secondary"
                className="!bg-[#252320] !text-[#faf9f5] !border-[#3d3d3a] hover:!bg-[#2e2b28]"
              >
                Read the Documentation <ArrowRight size={16} className="ml-2" />
              </AgencyButton>
            </div>
          </div>
        </div>
      </section>
    ),
    controls: {
      title: { type: "text", label: "Title" },
      subtitle: { type: "textarea", label: "Subtitle" },
      codeSnippet: { type: "textarea", label: "Code Snippet" },
    },
  },

  CoralCallout: {
    name: "Coral Callout",
    category: "Sections",
    render: ({ headline, ctaText, className, ...props }) => (
      <section
        className={clsx(
          "w-full bg-[#faf9f5] py-16 lg:py-[96px] px-4 md:px-12",
          className,
        )}
        {...props}
      >
        <div className="max-w-[1200px] mx-auto bg-[#cc785c] rounded-[16px] p-10 md:p-[64px] flex flex-col items-center text-center gap-6 md:gap-8">
          <SerifDisplay
            size="sm"
            className="text-[#ffffff] max-w-2xl mx-auto"
            data-studio-editable="headline"
          >
            {headline}
          </SerifDisplay>
          <button className="font-sans-body text-[14px] font-medium bg-[#faf9f5] text-[#141413] rounded-[8px] h-[40px] px-[24px] hover:bg-[#efe9de] transition-colors whitespace-nowrap">
            <span data-studio-editable="ctaText">{ctaText}</span>
          </button>
        </div>
      </section>
    ),
    controls: {
      headline: { type: "text", label: "Headline" },
      ctaText: { type: "text", label: "CTA Text" },
    },
  },

  AgencyFooter: {
    name: "Footer",
    category: "Global",
    render: ({ brandName, className, ...props }) => (
      <footer
        className={clsx(
          "w-full bg-[#181715] pt-12 md:pt-[64px] pb-[32px] px-6 md:px-12",
          className,
        )}
        {...props}
      >
        <div className="max-w-[1200px] mx-auto flex flex-col gap-12 md:gap-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-1 sm:col-span-2 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Sparkles
                  className="w-5 h-5 text-[#faf9f5]"
                  strokeWidth={2.5}
                />
                <span
                  className="font-sans-body font-semibold text-[#faf9f5] text-[18px]"
                  data-studio-editable="brandName"
                >
                  {brandName}
                </span>
              </div>
              <p className="font-sans-body text-[14px] text-[#a09d96] max-w-sm">
                A performance marketing agency combining rigorous data science
                with editorial creative to drive asymmetrical growth.
              </p>
            </div>
            <div className="flex flex-col gap-3 font-sans-body text-[14px]">
              <span className="font-semibold text-[#faf9f5] mb-2">
                Services
              </span>
              <span className="text-[#a09d96] cursor-pointer hover:text-[#faf9f5] transition-colors">
                Paid Acquisition
              </span>
              <span className="text-[#a09d96] cursor-pointer hover:text-[#faf9f5] transition-colors">
                SEO & Content
              </span>
              <span className="text-[#a09d96] cursor-pointer hover:text-[#faf9f5] transition-colors">
                Conversion Ops
              </span>
            </div>
            <div className="flex flex-col gap-3 font-sans-body text-[14px]">
              <span className="font-semibold text-[#faf9f5] mb-2">Agency</span>
              <span className="text-[#a09d96] cursor-pointer hover:text-[#faf9f5] transition-colors">
                About
              </span>
              <span className="text-[#a09d96] cursor-pointer hover:text-[#faf9f5] transition-colors">
                Careers
              </span>
              <span className="text-[#a09d96] cursor-pointer hover:text-[#faf9f5] transition-colors">
                Contact
              </span>
            </div>
          </div>
          <div className="w-full border-t border-[#3d3d3a] pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans-body text-[13px] text-[#8e8b82]">
            <span>© 2026 {brandName}. All rights reserved.</span>
            <div className="flex gap-6">
              <span className="cursor-pointer hover:text-[#faf9f5]">
                Privacy
              </span>
              <span className="cursor-pointer hover:text-[#faf9f5]">Terms</span>
            </div>
          </div>
        </div>
      </footer>
    ),
    controls: {
      brandName: { type: "text", label: "Brand Name" },
    },
  },
};

// ============================================================================
// DEFAULT PAGE DATA (JSON Schema)
// ============================================================================
const agencyWebsiteSchema: WebsiteSchema = {
  projectSettings: { name: "Vantage Digital" },
  designSystem: { tokens: {} },
  pages: [
    {
      id: "page_home",
      slug: "/",
      title: "Home",
      content: [
        {
          id: "nav_1",
          type: "AgencyNav",
          props: { brandName: "Vantage", ctaText: "Start Project" },
        },
        {
          id: "hero_1",
          type: "AgencyHero",
          props: {
            headline: "Precision marketing for modern brands.",
            subhead:
              "We combine rigorous data science with editorial creative to drive asymmetrical growth for B2B and SaaS companies.",
            primaryCta: "View Case Studies",
            secondaryCta: "Our Methodology",
          },
        },
        {
          id: "features_wrapper",
          type: "FeatureGrid",
          props: {
            sectionTitle: "Growth, engineered systematically.",
          },
          children: [
            {
              id: "feat_1",
              type: "FeatureCard",
              props: {
                title: "Paid Acquisition",
                description:
                  "Algorithmic bidding and high-velocity creative testing across Search and Social ecosystems.",
                icon: "Megaphone",
              },
            },
            {
              id: "feat_2",
              type: "FeatureCard",
              props: {
                title: "Conversion Ops",
                description:
                  "Iterative landing page experiments driven by heatmaps, session recordings, and statistical significance.",
                icon: "MousePointerClick",
              },
            },
            {
              id: "feat_3",
              type: "FeatureCard",
              props: {
                title: "Data & Attribution",
                description:
                  "Server-side tracking and multi-touch attribution modeling to reveal true customer acquisition costs.",
                icon: "LineChart",
              },
            },
          ],
        },
        {
          id: "dark_mockup_1",
          type: "DarkProductMockup",
          props: {
            title: "Your data, stripped of the noise.",
            subtitle:
              "We don't just run ads. We deploy proprietary attribution models that ingest omnichannel streams to show you exactly which touchpoints drive revenue, not just clicks.",
          },
        },
        {
          id: "callout_1",
          type: "CoralCallout",
          props: {
            headline: "Ready to scale your digital presence?",
            ctaText: "Book a Strategy Session",
          },
        },
        {
          id: "footer_1",
          type: "AgencyFooter",
          props: { brandName: "Vantage" },
        },
      ],
    },
  ],
};

// ============================================================================
// STORY RENDERER WITH TANSTACK ROUTER
// ============================================================================
export const BuilderMode: Story = {
  name: "Vantage Agency Builder",
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
          <div className="w-full bg-[#faf9f5] min-h-screen relative group/site">
            <FontsStyles />
            {isEditing ? (
              <WebsiteStudio.Builder
                components={agencyRegistry}
                initialState={agencyWebsiteSchema}
                onExit={() => setIsEditing(false)}
                topBarCenter={
                  <div className="text-sm font-semibold text-on-surface">
                    Vantage Agency UI
                  </div>
                }
              />
            ) : (
              <>
                <Outlet />
                <div className="fixed bottom-8 right-8 z-[9999] opacity-0 group-hover/site:translate-y-0 group-hover/site:opacity-100 transition-all duration-300">
                  <button
                    className="bg-[#cc785c] text-white px-6 py-3 rounded-full font-medium shadow-2xl flex items-center gap-2 hover:bg-[#a9583e] transition-colors cursor-pointer"
                    onClick={() => setIsEditing(true)}
                  >
                    <Settings size={18} />
                    Edit Design System
                  </button>
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
