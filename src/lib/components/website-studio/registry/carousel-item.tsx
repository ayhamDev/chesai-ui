import React from "react";
import { CarouselItem } from "../../material3-carousel";
import type { RegistryComponent } from "../types";

export const CarouselItemConfig: RegistryComponent = {
  name: "Carousel Item",
  category: "Media",
  render: (props) => {
    return (
      <CarouselItem
        {...props}
        imageUrl={props.imageUrl || "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&q=80"}
      />
    );
  },
  controls: {
    imageUrl: {
      type: "image",
      label: "Image URL",
      group: "Content",
      supportsCMS: true,
    },
    title: {
      type: "text",
      label: "Title",
      defaultValue: "Stunning View",
      group: "Content",
      supportsCMS: true,
    },
    subtitle: {
      type: "text",
      label: "Subtitle",
      defaultValue: "Explore the world",
      group: "Content",
      supportsCMS: true,
    },
  },
};
