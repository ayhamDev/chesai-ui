import React, { useState } from "react";
import { Button } from "../../button";
import { ButtonGroup } from "../../button-group";
import { Typography } from "../../typography";
import type { RegistryComponent } from "../types";

export const ShallowRouterConfig: RegistryComponent = {
  name: "Shallow Switch (Tabs)",
  category: "Interactions",
  acceptsChildren: true,
  render: ({ mode, ...props }) => {
    // In the studio builder, we mock the shallow routing state natively
    // so users can see different views swap out.
    const [activeTab, setActiveTab] = useState("tab1");

    return (
      <div className="w-full flex flex-col gap-4 border border-outline-variant/30 p-4 rounded-xl bg-surface-container-lowest" {...props}>
        <ButtonGroup shape="minimal" className="w-fit">
          <Button 
            variant={activeTab === "tab1" ? "primary" : "secondary"} 
            onClick={() => setActiveTab("tab1")}
            size="sm"
          >
            Tab 1
          </Button>
          <Button 
            variant={activeTab === "tab2" ? "primary" : "secondary"} 
            onClick={() => setActiveTab("tab2")}
            size="sm"
          >
            Tab 2
          </Button>
        </ButtonGroup>

        <div className="flex-1 p-6 border-2 border-dashed border-outline-variant/30 rounded-lg flex items-center justify-center bg-surface-container-highest/30">
          <Typography variant="body-small" className="opacity-50">
            {activeTab === "tab1" && "Drop content for Tab 1 here..."}
            {activeTab === "tab2" && "Drop content for Tab 2 here..."}
          </Typography>
        </div>
      </div>
    );
  },
  controls: {
    mode: {
      type: "select",
      label: "Routing Mechanism",
      group: "Advanced",
      defaultValue: "search",
      options: [
        { label: "Search Params (?tab=home)", value: "search" },
        { label: "Pathname (/home)", value: "pathname" },
        { label: "Memory (No URL change)", value: "memory" },
      ],
    },
  },
};
