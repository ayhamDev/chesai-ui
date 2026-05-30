import React from "react";
import { Carousel } from "../../material3-carousel";
import type { RegistryComponent } from "../types";

export const CarouselConfig: RegistryComponent = {
  name: "MD3 Carousel",
  category: "Media",
  acceptsChildren: true,
  render: ({ children, slidesPerView, loop, autoplay, height, ...props }) => (
    <div className="w-full" {...props}>
      <Carousel
        slidesPerView={slidesPerView}
        loop={loop}
        autoplay={autoplay}
        height={height}
      >
        {children}
      </Carousel>
    </div>
  ),
  controls: {
    height: {
      type: "text",
      label: "Carousel Height",
      defaultValue: "400px",
      group: "Layout",
    },
    slidesPerView: {
      type: "number",
      label: "Slides Per View",
      defaultValue: 3,
      min: 1,
      max: 6,
      step: 0.1,
      group: "Layout",
    },
    loop: {
      type: "boolean",
      label: "Infinite Loop",
      defaultValue: true,
      group: "Behavior",
    },
    autoplay: {
      type: "boolean",
      label: "Autoplay",
      defaultValue: true,
      group: "Behavior",
    },
  },
};
