"use client";

import { AlignLeft, AlignRight } from "lucide-react";
import { useLayout } from "../../context/layout-context";
import { IconButton } from "../icon-button";
import { Tooltip, TooltipProvider, TooltipTrigger } from "../tooltip";

export const LayoutDirectionToggle = () => {
  const { isRtl, toggleDirection } = useLayout();

  return (
    <TooltipProvider>
      <TooltipTrigger asChild>
        <IconButton
          variant="ghost"
          size="sm"
          onClick={toggleDirection}
          aria-label={isRtl ? "Switch to LTR" : "Switch to RTL"}
        >
          {isRtl ? (
            <AlignRight className="h-5 w-5" />
          ) : (
            <AlignLeft className="h-5 w-5" />
          )}
        </IconButton>
      </TooltipTrigger>
      <Tooltip>
        {isRtl ? "Switch to Left-to-Right" : "Switch to Right-to-Left"}
      </Tooltip>
    </TooltipProvider>
  );
};
