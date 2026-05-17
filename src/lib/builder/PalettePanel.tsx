import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Type,
  Square,
  MousePointerClick,
  Image as ImageIcon,
  CreditCard,
  LayoutTemplate,
} from "lucide-react";
import { Typography } from "../components/typography";
import { clsx } from "clsx";

// Generic Draggable Component
const DraggableBlock = ({
  type,
  label,
  icon: Icon,
  isBlock = false,
}: {
  type: string;
  label: string;
  icon: any;
  isBlock?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `palette-${type}`,
      data: {
        type,
        isNew: true,
        isBlock, // Tell the Editor Shell if this is a basic component or a complex block tree
      },
    });

  const style = { transform: CSS.Translate.toString(transform) };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={clsx(
        "flex flex-col items-center justify-center p-4 gap-2 bg-surface border border-outline-variant/30 rounded-xl cursor-grab hover:border-primary transition-colors",
        isDragging && "opacity-50 z-50 shadow-xl",
      )}
    >
      <Icon className="w-6 h-6 text-on-surface-variant" />
      <Typography
        variant="label-small"
        className="font-semibold text-center leading-tight"
      >
        {label}
      </Typography>
    </div>
  );
};

export const PalettePanel = () => {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <Typography
          variant="label-small"
          className="font-bold opacity-60 uppercase tracking-widest mb-3"
        >
          Basics
        </Typography>
        <div className="grid grid-cols-2 gap-3">
          <DraggableBlock type="Container" label="Container" icon={Square} />
          <DraggableBlock type="Typography" label="Text" icon={Type} />
          <DraggableBlock
            type="Button"
            label="Button"
            icon={MousePointerClick}
          />
          <DraggableBlock type="Image" label="Image" icon={ImageIcon} />
        </div>
      </div>

      <div>
        <Typography
          variant="label-small"
          className="font-bold opacity-60 uppercase tracking-widest mb-3"
        >
          Blocks
        </Typography>
        <div className="grid grid-cols-2 gap-3">
          <DraggableBlock
            isBlock
            type="HeroSection"
            label="Hero Section"
            icon={LayoutTemplate}
          />
          <DraggableBlock
            isBlock
            type="ProfileCard"
            label="Profile Card"
            icon={CreditCard}
          />
        </div>
      </div>
    </div>
  );
};
