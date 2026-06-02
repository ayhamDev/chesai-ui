"use client";

import { Check, Type, ChevronDown, Play } from "lucide-react";
import { useTheme } from "../../context/ThemeProvider";
import { Button } from "../button";
import { Switch } from "../switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { PRESET_FONTS } from "../../utils/font-loader";

export const FontPicker = () => {
  const { fonts, setFonts, animationStyle, setAnimationStyle } = useTheme();

  const brandOptions = Object.keys(PRESET_FONTS);
  const bodyOptions = Object.keys(PRESET_FONTS);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              startIcon={<Type className="w-4 h-4" />}
              endIcon={<ChevronDown className="w-3 h-3 opacity-50" />}
            >
              Header: {PRESET_FONTS[fonts.brand]?.name || fonts.brand}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto">
            <DropdownMenuLabel>Headline Font</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {brandOptions.map((fontName) => (
                <DropdownMenuItem
                  key={`brand-${fontName}`}
                  onClick={() => setFonts({ brand: fontName })}
                >
                  <span
                    className="flex-1 text-base truncate"
                    style={{ fontFamily: PRESET_FONTS[fontName].value }}
                  >
                    {PRESET_FONTS[fontName].name}
                  </span>
                  {fonts.brand === fontName && (
                    <Check className="ml-2 h-4 w-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              startIcon={<Type className="w-4 h-4" />}
              endIcon={<ChevronDown className="w-3 h-3 opacity-50" />}
            >
              Body: {PRESET_FONTS[fonts.plain]?.name || fonts.plain}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto">
            <DropdownMenuLabel>Body Text Font</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {bodyOptions.map((fontName) => (
                <DropdownMenuItem
                  key={`body-${fontName}`}
                  onClick={() => setFonts({ plain: fontName })}
                >
                  <span
                    className="flex-1 text-sm truncate"
                    style={{ fontFamily: PRESET_FONTS[fontName].value }}
                  >
                    {PRESET_FONTS[fontName].name}
                  </span>
                  {fonts.plain === fontName && (
                    <Check className="ml-2 h-4 w-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-3 pl-0 sm:pl-4 sm:border-l border-outline-variant">
        <label
          htmlFor="expressive-toggle"
          className="text-sm font-medium text-on-surface cursor-pointer select-none flex items-center gap-2"
        >
          <Play size={14} className="opacity-70" />
          Expressive Motion
        </label>
        <Switch
          id="expressive-toggle"
          size="sm"
          checked={animationStyle === "expressive"}
          onCheckedChange={(checked) =>
            setAnimationStyle(checked ? "expressive" : "standard")
          }
        />
      </div>
    </div>
  );
};
