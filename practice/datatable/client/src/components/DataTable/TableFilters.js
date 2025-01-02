"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export default function TableFilters({
  filterOptions,
  selectedFilters,
  filterSearch,
  handleToggleValue,
  handleSearchDropdown,
  calculateFilterCounts,
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {Object.keys(filterOptions).map((field) => {
        const allValues = filterOptions[field] || [];
        const selectedValues = selectedFilters[field] || [];
        const searchText = filterSearch[field] || "";
        const displayedValues = allValues.filter((val) =>
          val.toLowerCase().includes(searchText.toLowerCase())
        );

        return (
          <DropdownMenu key={field}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                {field.charAt(0).toUpperCase() + field.slice(1)}
                {selectedValues.length > 0 && (
                  <span className="ml-1 truncate max-w-xs text-muted-foreground">
                    : {selectedValues.join(", ")}
                  </span>
                )}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel>{field.toUpperCase()}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <div className="p-2 w-full">
                  <Input
                    placeholder={`Search ${field}...`}
                    value={searchText}
                    onChange={(e) => handleSearchDropdown(field, e.target.value)}
                  />
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {displayedValues.length === 0 ? (
                <DropdownMenuItem>No {field} found</DropdownMenuItem>
              ) : (
                displayedValues.map((val) => {
                  const isChecked = selectedValues.includes(val);
                  const count = calculateFilterCounts(field, val);
                  return (
                    <DropdownMenuItem
                      key={val}
                      className="flex items-center gap-2 justify-between"
                      onSelect={(e) => {
                        e.preventDefault();
                        handleToggleValue(field, val, !isChecked);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox checked={isChecked} />
                        <span>{val}</span>
                      </div>
                      <span className="text-muted-foreground">{count}</span>
                    </DropdownMenuItem>
                  );
                })
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500"
                onSelect={(e) => {
                  e.preventDefault();
                  handleToggleValue(field, null, false, true);
                }}
              >
                Clear filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </div>
  );
}
