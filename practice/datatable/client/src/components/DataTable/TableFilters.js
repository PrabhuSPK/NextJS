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
  <DropdownMenuContent align="start" className="w-48 p-2 text-sm">
    <DropdownMenuLabel className="text-xs font-semibold">
      {formatHeader(field)}
    </DropdownMenuLabel>
    <DropdownMenuSeparator className="my-1" />
    <DropdownMenuItem asChild>
      <div className="p-2 w-full">
        <Input
          placeholder={`Search ${formatHeader(field)}...`}
          value={searchText}
          onChange={(e) => handleSearchDropdown(field, e.target.value)}
          className="text-sm"
        />
      </div>
    </DropdownMenuItem>
    <DropdownMenuSeparator className="my-1" />
    {displayedValues.length === 0 ? (
      <DropdownMenuItem className="text-xs text-gray-500">
        No {formatHeader(field)} found
      </DropdownMenuItem>
    ) : (
      displayedValues.map((val) => {
        const isChecked = selectedValues.includes(val);
        const count = calculateFilterCounts(field, val);
        return (
          <DropdownMenuItem
            key={val}
            className="flex items-center gap-2 justify-between text-sm"
            onSelect={(e) => {
              e.preventDefault();
              handleToggleValue(field, val, !isChecked);
            }}
          >
            <div className="flex items-center gap-2">
              <Checkbox checked={isChecked} />
              <span>{val}</span>
            </div>
            <span className="text-gray-500 text-xs">{count}</span>
          </DropdownMenuItem>
        );
      })
    )}
    <DropdownMenuSeparator className="my-1" />
    <DropdownMenuItem
      className="text-red-500 text-xs flex justify-center items-center"
      onSelect={(e) => {
        e.preventDefault();
        handleToggleValue(field, null, false, true);
      }}
    >
      Clear
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
          <Button
                  variant="outline"
                  className="flex items-center px-4 py-2 rounded-md border-dashed border-2 border-black-400"
                >
              Visibility <ChevronDown className="ml-1 h-4 w-4" />
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
    </div>
  );
}
