"use client";

import type { Table } from "@tanstack/react-table";
import { createContext, useContext } from "react";
import type { InputProps } from "../input";

export type DataTableSearchInputProps = Partial<
  Omit<
    InputProps,
    "value" | "defaultValue" | "onChange" | "onValueChange"
  >
>;

interface DataTableContextProps<TData> {
  table: Table<TData>;
  searchInputProps?: DataTableSearchInputProps;
}

const DataTableContext = createContext<DataTableContextProps<any> | null>(null);

export function useDataTable<TData>() {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error("useDataTable must be used within a DataTable provider");
  }
  return context as DataTableContextProps<TData>;
}

export { DataTableContext };
