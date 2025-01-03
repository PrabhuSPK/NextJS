"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function ColumnVisibilityManager({ table }) {
  return (
    <div className="flex items-center gap-4">
      {/* Visibility Dropdown Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center">
            Visibility <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          onClick={(e) => e.stopPropagation()} // Prevent closing the dropdown
        >
          <DropdownMenuLabel>Toggle Column Visibility</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table.getAllColumns().map((column) => (
            <div
              key={column.id}
              className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100"
            >
              <Checkbox
                checked={column.getIsVisible()}
                onCheckedChange={() => column.toggleVisibility()}
              />
              <span className="capitalize">{column.id}</span>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
