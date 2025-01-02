"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DataSearch({
  globalFilter,
  setGlobalFilter,
  handleResetFilters,
}) {
  return (
    <div className="flex items-center gap-4 py-4">
      <Input
        placeholder="Search across all columns..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />
      <Button variant="outline" onClick={handleResetFilters}>
        Reset All Filters
      </Button>
    </div>
  );
}
