"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function ColumnVisibilityManager({ table }) {
  // Toggle column visibility and handle both checkbox state and value selection
  const handleCheckboxChange = (column) => {
    column.toggleVisibility(); // Toggles the visibility state of the column
  };

  return (
    <div className="flex items-center gap-4">
      {/* Visibility Dropdown Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center px-4 py-2 rounded-md border-dashed border-2 border-black-400">
            Visibility <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
          onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
        >
          <DropdownMenuLabel>Toggle Column Visibility</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table.getAllColumns().map((column) => (
            <div
              key={column.id}
              className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation(); // Prevent dropdown from closing
                handleCheckboxChange(column); // Toggle visibility
              }}
            >
              <Checkbox
                checked={column.getIsVisible()}
                onCheckedChange={() => handleCheckboxChange(column)}
              />
              <span className="capitalize">{column.id}</span>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
