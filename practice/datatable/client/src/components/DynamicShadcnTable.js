"use client";

import React, { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Multi-value filter function
function multiValueFilterFn(row, columnId, filterValues) {
  if (!filterValues || filterValues.length === 0) {
    return true;
  }
  const rowValue = row.getValue(columnId);
  return filterValues.includes(String(rowValue));
}

export default function DynamicShadcnTable({ apiUrl, searchableField = "name" }) {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState(""); // Global search feature
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [filterSearch, setFilterSearch] = useState({});
  const [pageSize, setPageSize] = useState(10); // Rows per page
  const [paginationLinks, setPaginationLinks] = useState({
    next: null,
    previous: null,
    count: 0,
    currentPage: 1,
    totalPages: 1,
  });

  const fetchData = async (url) => {
    try {
      setLoading(true);
      const response = await fetch(url);
      const json = await response.json();

      setData(json.results || []);
      const totalPages = Math.ceil(json.count / pageSize);
      const currentPage = json.next
        ? new URL(json.next).searchParams.get("page") - 1
        : totalPages;

      setPaginationLinks({
        next: json.next,
        previous: json.previous,
        count: json.count,
        currentPage: parseInt(currentPage, 10),
        totalPages,
      });

      // Extract filter options
      const opts = json.filter_options || {};
      setFilterOptions(opts);

      // Dynamically build columns based on the API response
      const builtColumns = [];
      if (json.results.length > 0) {
        const keys = Object.keys(json.results[0]);

        // Add "Select" column for row selection
        builtColumns.push({
          id: "select",
          header: ({ table }) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all rows"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        });

        // Add dynamic columns
        keys.forEach((key) => {
          builtColumns.push({
            accessorKey: key,
            filterFn: opts[key] ? "multiValue" : undefined,
            header: ({ column }) => (
              <Button
                variant="ghost"
                onClick={() => {
                  if (!column.getIsSorted()) {
                    column.toggleSorting(false);
                  } else {
                    column.toggleSorting();
                  }
                }}
                className="px-0"
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </Button>
            ),
            cell: ({ row }) => {
              const value = row.getValue(key);
              return value == null ? "—" : String(value);
            },
          });
        });
      }

      setColumns(builtColumns);

      // Set default visibility for all columns
      const visibilityState = builtColumns.reduce((acc, col) => {
        acc[col.accessorKey || col.id] = true;
        return acc;
      }, {});
      setColumnVisibility(visibilityState);
    } catch (error) {
      console.error("Error fetching table data:", error);
      setData([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData(`${apiUrl}?page_size=${pageSize}`);
  }, [apiUrl, pageSize]);

  const handleNavigate = (url) => {
    if (url) fetchData(url);
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    filterFns: {
      multiValue: multiValueFilterFn,
    },
    enableSortingRemoval: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleResetFilters = () => {
    setSelectedFilters({});
    setFilterSearch({});
    setGlobalFilter("");
    table.setColumnFilters([]);
  };

  const handleToggleValue = (field, value, checked) => {
    const updatedFilters = { ...selectedFilters };

    if (checked) {
      updatedFilters[field] = updatedFilters[field]
        ? [...updatedFilters[field], value]
        : [value];
    } else {
      updatedFilters[field] = updatedFilters[field].filter((v) => v !== value);
    }

    setSelectedFilters(updatedFilters);

    // Update column filter dynamically
    const col = table.getColumn(field);
    if (col) {
      col.setFilterValue(updatedFilters[field] || []);
    }
  };

  const handleSearchDropdown = (field, text) => {
    setFilterSearch((prev) => ({ ...prev, [field]: text }));
  };

  const calculateFilterCounts = (field, value) => {
    return table
      .getFilteredRowModel()
      .rows.filter((row) => String(row.original[field]) === value).length;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      {/* Global Search and Reset Filters */}
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

      {/* Column Visibility Dropdown */}
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

      {/* Filter Dropdowns */}
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
                    setSelectedFilters((prev) => ({ ...prev, [field]: [] }));
                    const col = table.getColumn(field);
                    if (col) col.setFilterValue([]);
                  }}
                >
                  Clear filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        {columns.length === 0 ? (
          <div className="p-4">No columns available.</div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          Showing {data.length} of {paginationLinks.count} rows.
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(`${apiUrl}?page=1&page_size=${pageSize}`)}
            disabled={paginationLinks.currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNavigate(paginationLinks.previous)}
            disabled={!paginationLinks.previous}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm">
            Page {paginationLinks.currentPage} of {paginationLinks.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNavigate(paginationLinks.next)}
            disabled={!paginationLinks.next}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              fetchData(
                `${apiUrl}?page=${paginationLinks.totalPages}&page_size=${pageSize}`
              )
            }
            disabled={paginationLinks.currentPage === paginationLinks.totalPages}
          >
            Last
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {pageSize}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[10, 20, 50].map((size) => (
                <DropdownMenuItem
                  key={size}
                  onSelect={() => setPageSize(size)}
                  className="cursor-pointer"
                >
                  {size}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
