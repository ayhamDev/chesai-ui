import React from "react";
import { Image, type ImageEffect } from "../../image";
import type { RegistryComponent } from "../types";

export const ImageConfig: RegistryComponent = {
  name: "Image",
  category: "Media",
  render: ({
    src,
    placeholderSrc,
    alt,
    variant,
    shape,
    aspectRatio,
    zoomOnHover,
    enableInspect,
    enableLightbox,
    ...props
  }) => {
    const effects: ImageEffect[] = [];
    if (enableInspect) effects.push("inspect");
    if (enableLightbox) effects.push("zoom");

    return (
      <div className="w-full flex justify-center" {...props}>
        <Image
          src={src || "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80"}
          placeholderSrc={placeholderSrc}
          alt={alt || "Image"}
          variant={variant}
          shape={shape}
          aspectRatio={aspectRatio}
          zoomOnHover={zoomOnHover}
          effects={effects}
          className="w-full max-w-full"
        />
      </div>
    );
  },
  controls: {
    src: {
      type: "image",
      label: "Image Source (URL)",
      group: "Source",
      supportsCMS: true,
      defaultValue: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80",
    },
    alt: {
      type: "text",
      label: "Alt Text",
      group: "Source",
      supportsCMS: true,
      defaultValue: "Beautiful landscape",
    },
    placeholderSrc: {
      type: "image",
      label: "Low-Res Placeholder (Blur-up)",
      group: "Source",
    },
    aspectRatio: {
      type: "select",
      label: "Aspect Ratio",
      group: "Layout",
      defaultValue: "auto",
      options: [
        { label: "Auto (Original)", value: "auto" },
        { label: "Square (1:1)", value: "square" },
        { label: "Video (16:9)", value: "video" },
        { label: "Portrait (3:4)", value: "portrait" },
        { label: "Wide (2:1)", value: "wide" },
      ],
    },
    variant: {
      type: "select",
      label: "Visual Variant",
      group: "Aesthetics",
      defaultValue: "default",
      options: [
        { label: "Default", value: "default" },
        { label: "Bordered", value: "bordered" },
        { label: "Elevated (Shadow)", value: "elevated" },
      ],
    },
    shape: {
      type: "select",
      label: "Shape",
      group: "Aesthetics",
      defaultValue: "md",
      options: [
        { label: "None (Sharp)", value: "none" },
        { label: "Small Radius", value: "sm" },
        { label: "Medium Radius", value: "md" },
        { label: "Large Radius", value: "lg" },
        { label: "Full (Circle/Pill)", value: "full" },
      ],
    },
    zoomOnHover: {
      type: "boolean",
      label: "Slight Zoom on Hover",
      group: "Interactions",
      defaultValue: false,
    },
    enableInspect: {
      type: "boolean",
      label: "Enable Magnifier Lens",
      group: "Interactions",
      defaultValue: false,
    },
    enableLightbox: {
      type: "boolean",
      label: "Enable Fullscreen Lightbox",
      group: "Interactions",
      defaultValue: false,
    },
  },
};
