// src/lib/components/website-studio/builder/InspectorPanel.tsx
import React from "react";
import { Settings2 } from "lucide-react";
import { Typography } from "../../typography";

interface InspectorPanelProps {
  selectedNodeIds: string[];
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedNodeIds,
}) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="h-12 border-b border-outline-variant/30 flex items-center px-4 gap-2 bg-surface-container-lowest shrink-0">
        <Settings2 className="w-4 h-4 opacity-70" />
        <Typography variant="label-medium" className="font-bold">
          Inspector
        </Typography>
      </div>
      <div className="flex-1 p-4 flex flex-col items-center justify-center opacity-50">
        {selectedNodeIds.length === 1 ? (
          <>
            <Typography variant="body-small">Properties for Node:</Typography>
            <Typography
              variant="label-medium"
              className="font-mono mt-2 break-all text-center"
            >
              {selectedNodeIds[0]}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body-small">
              Multiple Items Selected
            </Typography>
            <Typography
              variant="label-medium"
              className="font-mono mt-2 text-center"
            >
              {selectedNodeIds.length} items
            </Typography>
          </>
        )}
      </div>
    </div>
  );
};
