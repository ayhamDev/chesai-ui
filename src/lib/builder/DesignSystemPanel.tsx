import React from "react";
import { useBuilderStore } from "./store";
import { Typography } from "../components/typography";
import { ColorPicker } from "../components/color-picker";
import { Select } from "../components/select";
import { Switch } from "../components/switch";

const FONT_OPTIONS = [
  { value: "Manrope", label: "Manrope (Modern)" },
  { value: "Inter", label: "Inter (Clean)" },
  { value: "Playfair Display", label: "Playfair (Serif)" },
  { value: "Space Grotesk", label: "Space Grotesk (Tech)" },
  { value: "Roboto", label: "Roboto (Standard)" },
];

export const DesignSystemPanel = () => {
  const designSystem = useBuilderStore((state) => state.designSystem);
  const updateDesignSystem = useBuilderStore(
    (state) => state.updateDesignSystem,
  );

  const handleFontChange = (type: "brand" | "plain", value: string) => {
    updateDesignSystem({
      fonts: {
        ...designSystem.fonts,
        [type]: value,
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-surface-container">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant/20 shrink-0 bg-surface-container-high">
        <Typography variant="title-small" className="font-bold">
          Global Design System
        </Typography>
        <Typography variant="body-small" className="opacity-60">
          Theme colors and typography.
        </Typography>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-8">
        {/* Color Settings */}
        <div className="flex flex-col gap-4">
          <Typography
            variant="label-large"
            className="font-bold opacity-70 uppercase tracking-wider"
          >
            Brand Color
          </Typography>
          <ColorPicker
            label="Seed Color"
            variant="filled"
            value={designSystem.seedColor}
            onChange={(color) => updateDesignSystem({ seedColor: color })}
            description="Generates an entire harmonious color palette."
          />
        </div>

        {/* Typography Settings */}
        <div className="flex flex-col gap-4 border-t border-outline-variant/20 pt-6">
          <Typography
            variant="label-large"
            className="font-bold opacity-70 uppercase tracking-wider"
          >
            Typography
          </Typography>

          <Select
            label="Heading Font (Brand)"
            variant="filled"
            value={designSystem.fonts.brand}
            onValueChange={(val) => handleFontChange("brand", val)}
            items={FONT_OPTIONS}
          />

          <Select
            label="Body Font (Plain)"
            variant="filled"
            value={designSystem.fonts.plain}
            onValueChange={(val) => handleFontChange("plain", val)}
            items={FONT_OPTIONS}
          />

          <div className="mt-2 flex items-center justify-between p-3 bg-surface-container-high rounded-xl border border-outline-variant/30">
            <div className="flex flex-col">
              <Typography variant="label-medium" className="font-bold">
                Expressive Buttons
              </Typography>
              <Typography variant="body-small" className="opacity-60">
                Use Heading font on buttons
              </Typography>
            </div>
            <Switch
              checked={designSystem.fonts.expressiveButtons}
              onCheckedChange={(checked) =>
                updateDesignSystem({
                  fonts: { ...designSystem.fonts, expressiveButtons: checked },
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
