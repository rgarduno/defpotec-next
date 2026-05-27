"use client";

import { useState, useMemo } from "react";

export type SortDirection = "asc" | "desc" | null;

export interface SortConfig<T> {
  key: keyof T | string;
  direction: SortDirection;
}

export function useSortableData<T>(items: T[], config: SortConfig<T> | null = null) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(config);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null && sortConfig.direction !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key as keyof T];
        let bValue = b[sortConfig.key as keyof T];
        
        // Handle nested paths (e.g. "contact.name") if necessary, though typical usage will be flat keys
        if (typeof sortConfig.key === "string" && sortConfig.key.includes(".")) {
          const keys = sortConfig.key.split(".");
          aValue = keys.reduce((acc: any, curr) => acc?.[curr], a) as any;
          bValue = keys.reduce((acc: any, curr) => acc?.[curr], b) as any;
        }

        // Convert strings to lowercase for case-insensitive sorting
        if (typeof aValue === "string") {
          aValue = (aValue.toLowerCase() as any);
        }
        if (typeof bValue === "string") {
          bValue = (bValue.toLowerCase() as any);
        }

        if (aValue === null || aValue === undefined) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (bValue === null || bValue === undefined) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: keyof T | string) => {
    let direction: SortDirection = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    } else if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "desc"
    ) {
      // Third click removes sort, or we can just toggle between asc/desc.
      // Let's toggle between asc and desc for simplicity, but if we want to remove sort we could set it to null.
      // For now, let's keep it toggling between asc/desc
      direction = "asc"; // or null if we want a 3-way toggle
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
}

export function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active || !direction) return <span className="ml-1 opacity-20">↕</span>;
  return (
    <span className="ml-1 text-[#006828]">
      {direction === "asc" ? "↑" : "↓"}
    </span>
  );
}
