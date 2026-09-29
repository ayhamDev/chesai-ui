import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { Combobox } from "./index";
import { Code, Database, Palette, Zap } from "lucide-react";

const meta: Meta<typeof Combobox> = {
  title: "Components/Forms & Inputs/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    bordered: { control: "boolean", description: "Show the popup outer border (off by default)." },
    variant: {
      control: "select",
      options: [
        "filled",
        "filled-inverted",
        "outlined",
        "outlined-inverted",
        "underlined",
        "underlined-inverted",
        "ghost",
        "ghost-inverted",
      ],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    disabled: { control: "boolean" },
    isClearable: { control: "boolean" },
    forceMobileLayout: { control: "boolean" },
    sheetProps: { control: "object" },
    mobileLayout: {
      control: "select",
      options: ["default", "bottom-sheet", "dialog"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Combobox>;

const frameworks = [
  { value: "react", label: "React", icon: <Code className="w-4 h-4" /> },
  { value: "vue", label: "Vue", icon: <Palette className="w-4 h-4" /> },
  {
    value: "angular",
    label: "Angular",
    icon: <Database className="w-4 h-4" />,
  },
  { value: "svelte", label: "Svelte", icon: <Zap className="w-4 h-4" /> },
  { value: "solid", label: "SolidJS", disabled: true },
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
];

export const Default: Story = {
  args: {
    label: "Framework",
    placeholder: "Select framework...",
    searchPlaceholder: "Search frameworks...",
    options: frameworks,
    isClearable: true,
  },
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <div className="w-80">
        <Combobox {...args} value={value} onValueChange={setValue} />
      </div>
    );
  },
};

export const DesktopSheet: Story = {
  args: {
    label: "Framework",
    options: frameworks,
    mobileLayout: "bottom-sheet",
    forceMobileLayout: true,
  },
};

export const DetachedSheet: Story = {
  args: {
    ...DesktopSheet.args,
    sheetProps: { mode: "detached", shape: "full", variant: "secondary", glass: true },
  },
};

const remoteOptions = Array.from({ length: 100 }, (_, index) => ({
  value: String(index + 1), label: `Customer ${index + 1}`,
}));

function RemoteExample({ forceMobileLayout = false }: { forceMobileLayout?: boolean }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [options, setOptions] = useState<typeof remoteOptions>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // Simulated paginated server request; cleanup discards stale searches.
    const timer = setTimeout(() => {
      const results = remoteOptions.filter(option => option.label.toLowerCase().includes(search.toLowerCase()));
      setOptions(results.slice(0, (page + 1) * 20));
      setHasMore(results.length > (page + 1) * 20);
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, page]);

  return <div className="w-80">
    <Combobox
      label="Customer"
      options={options}
      searchValue={search}
      onSearchChange={query => {
        if (query === search) return;
        setSearch(query);
        setPage(0);
        setOptions([]);
        setIsLoading(true);
      }}
      shouldFilter={false}
      isLoading={isLoading}
      hasMore={hasMore}
      onLoadMore={() => setPage(previous => previous + 1)}
      forceMobileLayout={forceMobileLayout}
      description="Simulated server search and pages of 20 customers."
    />
  </div>;
}

export const ServerSearchAndInfiniteScroll: Story = {
  render: () => <RemoteExample />,
};

export const ServerSearchAndInfiniteScrollSheet: Story = {
  render: () => <RemoteExample forceMobileLayout />,
};

export const Variations: StoryObj = {
  name: "Variations & States",
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="flex flex-col gap-6 w-80">
        <Combobox
          label="Bordered & Clearable"
          variant="outlined"
          startContent={<Database className="w-4 h-4" />}
          options={frameworks}
          value={value}
          onValueChange={setValue}
          isClearable
        />
        <Combobox
          label="Outside Label"
          labelPlacement="outside"
          variant="filled"
          options={frameworks}
        />
        <Combobox
          label="Error State"
          isInvalid
          errorMessage="Please select a valid option."
          variant="filled"
          options={frameworks}
        />
        <Combobox
          label="Mobile Sheet"
          description="Resize screen to test mobile drawer"
          mobileLayout="bottom-sheet"
          variant="underlined"
          options={frameworks}
        />
      </div>
    );
  },
};
