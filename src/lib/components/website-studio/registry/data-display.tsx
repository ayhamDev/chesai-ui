import React from "react";
import { DataDisplay } from "../../data-display";
import { Card } from "../../card";
import { Typography } from "../../typography";
import type { RegistryComponent } from "../types";

const MOCK_DATA = Array.from({ length: 8 }).map((_, i) => ({
  id: i,
  title: `Sample Item ${i + 1}`,
  description: "This is a dynamically rendered item from the data array.",
  price: Math.floor(Math.random() * 100) + 10,
  category: ["Tech", "Design", "Marketing"][i % 3],
}));

export const DataDisplayConfig: RegistryComponent = {
  name: "Data Display (Grid/List)",
  category: "Data Display",
  render: ({ layout, enableSortControl, ...props }) => {
    const mockColumns = [
      { accessorKey: "title", header: "Title" },
      { accessorKey: "price", header: "Price" },
      { accessorKey: "category", header: "Category" },
    ];

    return (
      <div className="w-full bg-surface p-4 rounded-xl shadow-sm border border-outline-variant/30" {...props}>
        <DataDisplay
          data={MOCK_DATA}
          columns={mockColumns}
          layout={layout}
          enableSortControl={enableSortControl}
          gridProps={{ columns: { default: 1, sm: 2, lg: 3, xl: 4 }, gap: "md" }}
          masonryProps={{ columns: { default: 1, sm: 2, md: 3 }, gap: "md" }}
          renderItem={(row) => {
            const item = row.original;
            return (
              <Card
                key={item.id}
                variant="surface-container-lowest"
                shape="minimal"
                className="flex flex-col gap-2 shadow-sm border border-outline-variant/50 p-4 h-full"
              >
                <div className="w-full h-32 bg-secondary-container rounded-lg opacity-50 flex items-center justify-center text-on-secondary-container font-mono text-xs">
                  {item.category} Image
                </div>
                <Typography variant="title-medium" className="mt-2 font-bold">{item.title}</Typography>
                <Typography variant="body-small" className="opacity-70 line-clamp-2">{item.description}</Typography>
                <div className="mt-auto pt-4 flex justify-between items-center font-mono">
                  <span className="text-primary font-bold">${item.price}.00</span>
                </div>
              </Card>
            );
          }}
        />
      </div>
    );
  },
  controls: {
    layout: {
      type: "select",
      label: "Data Layout Mode",
      group: "Layout",
      defaultValue: "grid",
      options: [
        { label: "CSS Grid", value: "grid" },
        { label: "Vertical List", value: "list" },
        { label: "Masonry (Waterfall)", value: "masonry" },
      ],
    },
    enableSortControl: {
      type: "boolean",
      label: "Show Sort/Filter Toolbar",
      group: "Features",
      defaultValue: true,
    },
  },
};
