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
import { useRouter } from 'next/navigation'
import DeleteDialog from "@/components/CRUD/Delete";
import ColumnVisibilityManager from "@/components/DataTable/ColumnVisibilityManager"; // Importing the visibility manager

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
  table, // Pass table here for ColumnVisibilityManager
  selectedRowCount, // Assuming this is passed for delete functionality
  handleResetFilters, // Reset filters function
  fetchData, // Fetch data function
  apiUrl, // API URL
  pageSize, // Page size
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
                  className="flex items-center px-4 py-2 rounded-md border-dashed border-2 border-black-900"
                >
                  {formatHeader(field)}
                  {selectedValues.length > 0 && (
                    <span className="ml-1 truncate max-w-xs text-muted-foreground">
                      : {selectedValues.join(", ")}
                    </span>
                  )}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>{formatHeader(field)}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <div className="p-2 w-full">
                    <Input
                      placeholder={`Search ${formatHeader(field)}...`}
                      value={searchText}
                      onChange={(e) =>
                        handleSearchDropdown(field, e.target.value)
                      }
                    />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {displayedValues.length === 0 ? (
                  <DropdownMenuItem>
                    No {formatHeader(field)} found
                  </DropdownMenuItem>
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

      {/* Right side - Buttons Section */}
      <div className="flex items-center gap-4">
        {/* Delete Button */}
        {selectedRowCount > 0 && (
          <DeleteDialog
            rowSelection={selectedRowCount}
            apiUrl={apiUrl}
            pageSize={pageSize}
            fetchData={fetchData}
            setRowSelection={selectedRowCount}
            table={table}
          />
        )}

        {/* Create Button */}

        {/* Column Visibility Button */}
        <ColumnVisibilityManager table={table} /> {/* Using ColumnVisibilityManager component */}
        <Button onClick={() => router.push("/create-user")}>Create</Button>
      </div>
    </div>
  );
}
