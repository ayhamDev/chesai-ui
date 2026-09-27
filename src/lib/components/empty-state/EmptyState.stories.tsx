import type { Meta, StoryObj } from "@storybook/react";
import { Inbox, SearchX, Video } from "lucide-react";
import { useId } from "react";
import { Button } from "../button";
import { EmptyState } from "./index";

const meta: Meta<typeof EmptyState> = {
  title: "Components/Feedback/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

function MeetingIllustration() {
  const gradientId = useId();
  return (
    <svg viewBox="0 0 400 230" className="w-[380px] max-w-full h-auto" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId}>
          <stop stopColor="#ffdb19" />
          <stop offset="0.5" stopColor="#ffe04b" />
          <stop offset="1" stopColor="#f9bce9" />
        </linearGradient>
      </defs>
      <g stroke="#252525" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 215H388" fill="none" />
        <path d="M13 202V143C13 130 20 125 31 130C66 140 91 166 96 198C99 208 92 215 81 215H27C19 215 13 210 13 202Z" fill="#fac2ed" />
        <path d="M121 144H196C196 185 186 215 159 215C132 215 121 185 121 144Z" fill={`url(#${gradientId})`} />
        <path d="M196 162H210C232 162 230 186 209 186H192" fill="none" />
        <path d="M155 125C155 95 98 102 99 73C100 47 178 65 180 31" fill="none" />
        <path d="M219 215L259 101H390L350 215Z" fill="#fff" />
        <path d="M390 101C401 102 397 116 394 124L369 197C366 208 361 214 350 215Z" fill="#fac2ed" />
        <path d="M205 55L213 74L246 215H234L206 96Z" fill="#f9fc7b" />
        <path d="M205 55L206 76L213 74Z" fill="#fff" />
        <path d="M206 96L217 92L213 74L206 76Z" fill="#fff" />
        <path d="M280 128H327C334 128 331 135 329 141L315 180C314 185 311 188 306 188H267C261 188 259 187 262 180L276 140C278 133 282 129 289 128Z" fill="none" />
        <path d="M308 157L341 136C347 132 350 133 347 140L334 177C332 182 329 183 325 179L309 164C306 161 306 159 308 157Z" fill="none" />
        <ellipse cx="276" cy="175" rx="7" ry="5" transform="rotate(-35 276 175)" fill="none" />
        <path d="M228 33C257 4 284 19 263 65C284 44 306 29 336 28" fill="none" />
        <circle cx="358" cy="28" r="16" fill="#ffda12" stroke="none" />
        <path d="M358 12C366 12 373 18 374 26" fill="none" />
      </g>
    </svg>
  );
}

export const NoMeetingsWithIllustration: Story = {
  name: "No Meetings (Custom Illustration)",
  args: {
    visual: <MeetingIllustration />,
    title: "No meetings scheduled for this day",
    description: "Schedule a meeting or enjoy the free time",
    className: "gap-5 px-6 py-10",
    classNames: {
      title: "text-2xl! sm:text-4xl! font-normal!",
      description: "max-w-none text-lg! opacity-100",
      action: "mt-1",
    },
    action: <Button startIcon={<Video className="h-5 w-5" />} className="bg-[#bfefcf]! text-[#155b2b]! rounded-full px-8! h-14! text-lg!">New</Button>,
  },
  render: args => <div className="w-[850px] max-w-[calc(100vw-3rem)]"><EmptyState {...args} /></div>,
};

export const Default: Story = {
  args: {
    icon: <Inbox />,
    title: "No messages yet",
    description: "When you receive a new message, it will show up here.",
    action: <Button variant="secondary">Refresh Inbox</Button>,
  },
  render: (args) => (
    <div className="w-[600px] h-[400px] flex items-center justify-center bg-graphite-background border border-dashed rounded-xl">
      <EmptyState {...args} />
    </div>
  ),
};

export const SearchNoResults: Story = {
  name: "Search No Results (Card Variant)",
  args: {
    variant: "card",
    icon: <SearchX />,
    title: "No results found",
    description:
      "We couldn't find anything matching your search. Try adjusting your filters.",
    action: <Button variant="outline">Clear Filters</Button>,
  },
  render: (args) => (
    <div className="w-[600px]">
      <EmptyState {...args} />
    </div>
  ),
};
