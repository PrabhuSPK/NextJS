"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react"; // Import an 'X' icon from lucide-react

export default function DataSearch({
  globalFilter,
  setGlobalFilter,
  handleResetFilters,
}) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="relative max-w-sm">
        <Input
          placeholder="Search"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pr-10" // Add padding to the right for the icon
        />
        {globalFilter && (
          <button
            className="absolute top-1/2 right-2 -translate-y-1/2 text-red-500"
            onClick={() => setGlobalFilter("")} // Clear input on click
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button variant="outline" onClick={handleResetFilters}>
        Reset All Filters
      </Button>
    </div>
  );
}
