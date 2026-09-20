import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useRef, useState } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
import { Check, Search } from "lucide-react";
import { DirectionProvider, type Direction } from "./direction";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Select } from "../components/select";
import { NumberInput } from "../components/number-input";
import { Textarea } from "../components/textarea";
import { Checkbox } from "../components/checkbox";
import { Chip } from "../components/chip";
import { Slider } from "../components/slider";
import { Switch } from "../components/switch";
import { Toolbar } from "../components/toolbar";
import { Tabs } from "../components/tabs";
import { VirtualList } from "../components/virtual-list";

const meta = { title: "Showcase/RTL and LTR", parameters: { layout: "padded" } } satisfies Meta;
export default meta;

function Example({ initialDirection }: { initialDirection: Direction }) {
  const [dir, setDir] = useState(initialDirection);
  const [reverse, setReverse] = useState(false);
  const virtualizer = useRef<Virtualizer<HTMLElement, HTMLDivElement>>(null);
  return <DirectionProvider dir={dir} className="min-w-0 space-y-5 rounded-2xl border border-outline-variant bg-surface p-6" data-testid={`scope-${initialDirection}`}>
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-xl font-semibold">{dir === "rtl" ? "من اليمين إلى اليسار" : "Left to right"}</h2>
      <Button onClick={() => setDir(dir === "rtl" ? "ltr" : "rtl")}>Switch direction</Button>
    </div>
    <Input label="Search / بحث" startContent={<Search size={18} />} />
    <Select label="Status / الحالة" mobileLayout="default" items={[{ value: "active", label: "Active / نشط" }, { value: "pending", label: "Pending / قيد الانتظار" }]} />
    <NumberInput label="Quantity / الكمية" defaultValue={3} />
    <Textarea label="Notes / ملاحظات" />
    <div className="flex flex-wrap items-center gap-5"><Checkbox label="Selected / محدد" /><Chip startIcon={<Check size={16} />}>Available / متاح</Chip><Switch label="Enabled / مفعّل" defaultChecked /></div>
    <Slider defaultValue={[30]} step={10} withTicks withLabel />
    <Toolbar aria-label="Formatting"><Toolbar.Button>First</Toolbar.Button><Toolbar.Button>Second</Toolbar.Button><Toolbar.Button>Third</Toolbar.Button></Toolbar>
    <Tabs defaultValue="one" pageTransition="slide">
      <Tabs.List><Tabs.Trigger value="one">One / واحد</Tabs.Trigger><Tabs.Trigger value="two">Two / اثنان</Tabs.Trigger><Tabs.Trigger value="three">Three / ثلاثة</Tabs.Trigger></Tabs.List>
      <Tabs.Content><Tabs.Panel value="one">First panel</Tabs.Panel><Tabs.Panel value="two">Second panel</Tabs.Panel><Tabs.Panel value="three">Third panel</Tabs.Panel></Tabs.Content>
    </Tabs>
    <div className="flex flex-wrap gap-2"><Button onClick={() => virtualizer.current?.scrollToIndex(0, { align: "start" })}>First item</Button><Button onClick={() => virtualizer.current?.scrollToIndex(29, { align: "end" })}>Last item</Button><Button onClick={() => setReverse(!reverse)}>Reverse: {String(reverse)}</Button></div>
    <div className="h-24"><VirtualList data={Array.from({ length: 30 }, (_, i) => i + 1)} direction={reverse ? "horizontal-reverse" : "horizontal"} virtualizerRef={virtualizer} estimateSize={120} measureItems={false} containerProps={{ "aria-label": "Horizontal items" }} renderItem={item => <div className="flex h-full w-[120px] items-center justify-center rounded-xl bg-secondary-container">Item {item}</div>} /></div>
  </DirectionProvider>;
}

export const SideBySide: StoryObj = { render: () => <div dir="rtl" className="grid grid-cols-1 gap-6 xl:grid-cols-2"><Example initialDirection="ltr" /><Example initialDirection="rtl" /></div> };
