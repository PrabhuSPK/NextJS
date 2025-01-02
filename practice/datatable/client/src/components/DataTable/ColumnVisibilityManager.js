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
    <div className="flex items-center mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Manage Columns <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Toggle Column Visibility</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table.getAllColumns().map((column) => (
            <DropdownMenuItem
              key={column.id}
              className="flex items-center gap-2"
              onSelect={(e) => {
                e.preventDefault();
                column.toggleVisibility();
              }}
            >
              <Checkbox checked={column.getIsVisible()} />
              <span className="capitalize">{column.id}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
