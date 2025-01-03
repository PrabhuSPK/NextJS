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
import { ChevronDown, X } from "lucide-react";
import { useRouter } from "next/navigation";
import DeleteDialog from "@/components/CRUD/Delete";
import ColumnVisibilityManager from "@/components/DataTable/ColumnVisibilityManager";

// Converts snake_case or camelCase to Title Case
function formatHeader(header) {
  return header
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Add spaces before camelCase uppercase letters
    .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase()); // Capitalize the first letter of each word
}

export default function TableFilters({
  filterOptions,
  selectedFilters,
  filterSearch,
  handleToggleValue,
  handleSearchDropdown,
  calculateFilterCounts,
  table,
  selectedRowCount,
  handleResetFilters,
  fetchData,
  apiUrl,
  pageSize,
}) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mb-4">
      {/* Left side - Filters Section */}
      <div className="flex items-center gap-4 flex-wrap">
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
                <Button
                  variant="outline"
                  className="flex items-center px-4 py-2 rounded-md border-dashed border-2 border-black-400"
                >
                  {formatHeader(field)}
                  {selectedValues.length > 0 && (
                    <span className="ml-1 truncate max-w-xs text-muted-foreground text-xs">
                      : {selectedValues.join(", ")}
                    </span>
                  )}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 p-2 text-sm" // Fixed box size
                onClick={(e) => e.stopPropagation()} // Prevent dropdown close
              >
                <DropdownMenuLabel className="text-xs font-semibold">
                  {formatHeader(field)}
                </DropdownMenuLabel>

                {/* Input Wrapper with Clear Icon */}
                <div className="relative mt-2 mb-2">
                  <Input
                    placeholder={`Search`}
                    value={searchText}
                    className="pr-8 text-sm" // Add padding for the icon
                    onChange={(e) => handleSearchDropdown(field, e.target.value)}
                    onClick={(e) => e.stopPropagation()} // Prevent dropdown close
                  />
                  {searchText && (
                    <X
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-red-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent dropdown close
                        handleSearchDropdown(field, "");
                      }}
                    />
                  )}
                </div>

                <DropdownMenuSeparator className="my-1" />
                {displayedValues.length === 0 ? (
                  <div className="text-xs text-gray-500 px-2">
                    No {formatHeader(field)} found
                  </div>
                ) : (
                  displayedValues.map((val) => {
                    const isChecked = selectedValues.includes(val);
                    const count = calculateFilterCounts(field, val);
                    return (
                      <div
                        key={val}
                        className="flex items-center gap-2 justify-between px-2 py-1 text-sm cursor-pointer hover:bg-gray-100"
                        onClick={() => handleToggleValue(field, val, !isChecked)}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox checked={isChecked} />
                          <span>{val}</span>
                        </div>
                        <span className="text-gray-500 text-xs">{count}</span>
                      </div>
                    );
                  })
                )}
                <DropdownMenuSeparator className="my-1" />
                <div
                  className="text-red-500 text-xs flex justify-center items-center cursor-pointer py-1 hover:bg-gray-100"
                  onClick={() => handleToggleValue(field, null, false, true)}
                >
                  Clear
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
      </div>

      {/* Column Visibility Button */}
      <ColumnVisibilityManager table={table} />
    </div>
  );
}