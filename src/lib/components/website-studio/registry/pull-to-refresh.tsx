import React from "react";
import { PullToRefresh } from "../../pull-to-refresh";
import type { RegistryComponent } from "../types";

export const PullToRefreshConfig: RegistryComponent = {
  name: "Pull To Refresh Wrapper",
  category: "Interactions",
  acceptsChildren: true,
  render: ({ pullThreshold, children, ...props }) => (
    <div className="w-full h-[400px] border border-dashed border-primary/50 rounded-xl overflow-hidden relative" {...props}>
      <div className="absolute top-2 left-2 z-50 text-xs font-mono opacity-50 pointer-events-none bg-surface/50 px-2 rounded">
        Drag down to test refresh
      </div>
      <PullToRefresh
        pullThreshold={pullThreshold}
        onRefresh={async () => {
          console.log("Refreshing triggered in Studio...");
          await new Promise((r) => setTimeout(r, 1500));
        }}
        className="w-full h-full bg-surface-container-lowest"
      >
        <div className="p-4 h-[600px] w-full">
          {children || (
            <div className="w-full h-full border-2 border-dashed border-outline-variant/30 rounded-xl flex items-center justify-center text-sm opacity-50">
              Drop scrollable list content here
            </div>
          )}
        </div>
      </PullToRefresh>
    </div>
  ),
  controls: {
    pullThreshold: {
      type: "slider",
      label: "Pull Distance Threshold (px)",
      group: "Behavior",
      defaultValue: 100,
      min: 50,
      max: 250,
      step: 10,
    },
  },
};
