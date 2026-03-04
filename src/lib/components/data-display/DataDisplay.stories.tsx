import type { Meta, StoryObj } from "@storybook/react";
import { ColumnDef } from "@tanstack/react-table";
import { Check, Mail, MoreHorizontal, Star, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { Avatar } from "../avatar";
import { Badge } from "../badge";
import { Button } from "../button";
import { Card } from "../card";
import { Checkbox } from "../checkbox";
import { DataTableColumnHeader } from "../data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { IconButton } from "../icon-button";
import { GridItem } from "../layout/grid";
import { Typography } from "../typography";
import { DataDisplay } from "./index";

const meta: Meta<typeof DataDisplay> = {
  title: "Components/Data/DataDisplay",
  component: DataDisplay,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

// --- MOCK DATA ---
type Product = {
  id: string;
  name: string;
  category: "Electronics" | "Clothing" | "Home" | "Toys";
  price: number;
  stock: number;
  rating: number;
  image: string;
};

const PRODUCTS: Product[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `prod-${i}`,
  name: `Product ${i + 1} - ${["Super", "Ultra", "Mega", "Pro"][i % 4]} Edition`,
  category: ["Electronics", "Clothing", "Home", "Toys"][i % 4] as any,
  price: Math.floor(Math.random() * 500) + 20,
  stock: Math.floor(Math.random() * 100),
  rating: Math.random() * 2 + 3, // 3.0 to 5.0
  image: `https://i.pravatar.cc/300?u=prod-${i}`, // Using avatars as placeholders
}));

// --- COLUMNS (Needed for Logic, even if hidden) ---
const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name", // Used by Sort Dropdown
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "category",
    header: "Category",
    filterFn: "equals",
  },
  {
    accessorKey: "rating",
    header: "Rating",
  },
];

// --- 1. CARD GRID LAYOUT ---

export const ProductGrid: StoryObj<typeof DataDisplay> = {
  name: "1. Product Grid (Selection & Sort)",
  render: () => {
    return (
      <DataDisplay
        data={PRODUCTS}
        columns={columns}
        layout="grid"
        gridProps={{ columns: { default: 1, sm: 2, md: 3, xl: 4 }, gap: "md" }}
        // --- SELECTION BULK ACTIONS ---
        bulkActions={(table) => (
          <Button
            variant="destructive"
            size="sm"
            onClick={() =>
              alert(`Deleted ${table.getSelectedRowModel().rows.length} items`)
            }
            startIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete Selected
          </Button>
        )}
        // --- RENDER ITEM ---
        renderItem={(row) => {
          const product = row.original;
          const isSelected = row.getIsSelected();

          return (
            <GridItem>
              <Card
                className={`flex flex-col h-full transition-all duration-200 cursor-pointer overflow-hidden ${isSelected ? "ring-2 ring-primary bg-primary-container/10" : "hover:shadow-md"}`}
                padding="none"
                shape="minimal"
                onClick={() => row.toggleSelected()}
              >
                <div className="relative h-48 bg-surface-container-highest">
                  <img
                    src={product.image}
                    className="w-full h-full object-cover opacity-80"
                    alt={product.name}
                  />
                  <div className="absolute top-2 right-2">
                    <Checkbox
                      checked={isSelected}
                      readOnly
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  <Badge
                    variant="secondary"
                    className="absolute bottom-2 left-2 shadow-sm"
                  >
                    {product.category}
                  </Badge>
                </div>

                <div className="p-4 flex flex-col flex-1 gap-2">
                  <div className="flex justify-between items-start">
                    <Typography variant="title-small" className="line-clamp-2">
                      {product.name}
                    </Typography>
                    <Typography variant="label-large" className="text-primary">
                      ${product.price}
                    </Typography>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-2 border-t border-outline-variant/50">
                    <div className="flex items-center gap-1 text-orange-500">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs font-bold">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-on-surface-variant">
                      {product.stock} in stock
                    </span>
                  </div>
                </div>
              </Card>
            </GridItem>
          );
        }}
      />
    );
  },
};

// --- 2. LIST LAYOUT ---

export const UserList: StoryObj<typeof DataDisplay> = {
  name: "2. User List (Custom Row Layout)",
  render: () => {
    // Just reusing the same data for simplicity
    return (
      <DataDisplay
        data={PRODUCTS}
        columns={columns}
        layout="list"
        renderItem={(row) => {
          const product = row.original;
          return (
            <Card
              variant="ghost"
              hoverEffect={true}
              padding="sm"
              className="flex items-center gap-4 group"
            >
              <Avatar src={product.image} size="md" shape="minimal" />

              <div className="flex-1 min-w-0">
                <Typography variant="title-small" className="truncate">
                  {product.name}
                </Typography>
                <div className="flex gap-2 text-xs text-on-surface-variant">
                  <span>{product.category}</span>
                  <span>•</span>
                  <span>SKU: {product.id}</span>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <div className="font-mono font-bold">${product.price}</div>
                <div
                  className={`text-xs ${product.stock < 20 ? "text-error" : "text-green-600"}`}
                >
                  {product.stock < 20 ? "Low Stock" : "In Stock"}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </IconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem className="text-error">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Card>
          );
        }}
      />
    );
  },
};

// --- 3. MASONRY LAYOUT ---

const MASONRY_DATA = PRODUCTS.map((p) => ({
  ...p,
  height: 150 + Math.floor(Math.random() * 200), // Random heights
}));

export const MasonryLayout: StoryObj<typeof DataDisplay> = {
  name: "3. Masonry Layout",
  render: () => (
    <DataDisplay
      data={MASONRY_DATA}
      columns={columns}
      layout="masonry"
      masonryProps={{ columns: { default: 2, md: 3, lg: 4 }, gap: "md" }}
      renderItem={(row) => {
        const item = row.original;
        return (
          <Card
            className="w-full flex flex-col justify-end p-4 text-white relative overflow-hidden group mb-4"
            style={{
              height: item.height,
              backgroundColor: `hsl(${item.price % 360}, 60%, 40%)`,
            }}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            <div className="relative z-10">
              <Typography variant="title-medium">{item.name}</Typography>
              <div className="flex gap-2 mt-2">
                <Badge
                  variant="secondary"
                  shape="full"
                  className="bg-white/20 text-white backdrop-blur-sm border-none"
                >
                  {item.category}
                </Badge>
              </div>
            </div>
          </Card>
        );
      }}
    />
  ),
};
