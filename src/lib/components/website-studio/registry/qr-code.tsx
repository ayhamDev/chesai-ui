import React from "react";
import { QRCode } from "../../qr-code";
import type { RegistryComponent } from "../types";

export const QRCodeConfig: RegistryComponent = {
  name: "QR Code",
  category: "Elements",
  render: ({
    value,
    size,
    dotShape,
    cornerFrameShape,
    cornerDotShape,
    variant,
    shadow,
    color,
    cornerColor,
    logo,
    showToolbar,
    ...props
  }) => (
    <div className="w-full flex justify-center" {...props}>
      <QRCode
        value={value || "https://chesai-ui.pages.dev"}
        size={size}
        dotShape={dotShape}
        cornerFrameShape={cornerFrameShape}
        cornerDotShape={cornerDotShape}
        variant={variant}
        shadow={shadow}
        color={color || "currentColor"}
        cornerColor={cornerColor || color || "currentColor"}
        logo={logo}
        className="max-w-full"
      >
        <QRCode.Canvas />
        {showToolbar && (
          <div className="mt-4 w-full">
            <QRCode.Toolbar />
          </div>
        )}
      </QRCode>
    </div>
  ),
  controls: {
    value: {
      type: "text",
      label: "Data / URL",
      defaultValue: "https://chesai-ui.pages.dev",
      group: "Content",
      supportsCMS: true,
    },
    size: {
      type: "number",
      label: "Size (px)",
      defaultValue: 250,
      min: 100,
      max: 600,
      step: 10,
      group: "Layout",
    },
    logo: {
      type: "image",
      label: "Center Logo URL (Optional)",
      group: "Content",
      supportsCMS: true,
    },
    showToolbar: {
      type: "boolean",
      label: "Show Copy/Download Toolbar",
      group: "Behavior",
      defaultValue: false,
    },
    dotShape: {
      type: "select",
      label: "Inner Data Dots Shape",
      group: "Aesthetics",
      defaultValue: "rounded",
      options: [
        { label: "Square", value: "square" },
        { label: "Circle", value: "circle" },
        { label: "Rounded", value: "rounded" },
        { label: "Classy", value: "classy" },
        { label: "Diamond", value: "diamond" },
      ],
    },
    cornerFrameShape: {
      type: "select",
      label: "Outer Corner Eye Shape",
      group: "Aesthetics",
      defaultValue: "extra-rounded",
      options: [
        { label: "Square", value: "square" },
        { label: "Circle", value: "circle" },
        { label: "Rounded", value: "rounded" },
        { label: "Extra Rounded", value: "extra-rounded" },
        { label: "Leaf", value: "leaf" },
      ],
    },
    cornerDotShape: {
      type: "select",
      label: "Inner Corner Eye Shape",
      group: "Aesthetics",
      defaultValue: "circle",
      options: [
        { label: "Square", value: "square" },
        { label: "Circle", value: "circle" },
        { label: "Rounded", value: "rounded" },
        { label: "Diamond", value: "diamond" },
      ],
    },
    color: {
      type: "color",
      label: "Primary Code Color",
      group: "Aesthetics",
    },
    cornerColor: {
      type: "color",
      label: "Corner Eye Color Override",
      group: "Aesthetics",
    },
    variant: {
      type: "select",
      label: "Background Variant",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary Surface", value: "primary" },
        { label: "Secondary Surface", value: "secondary" },
        { label: "Pure White", value: "white" },
        { label: "Ghost (Transparent)", value: "ghost" },
      ],
    },
    shadow: {
      type: "select",
      label: "Background Shadow",
      group: "Aesthetics",
      defaultValue: "none",
      options: [
        { label: "None", value: "none" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
  },
};
