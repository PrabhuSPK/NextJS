"use client";

import React, { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

// Icons
import { ArrowUpDown } from "lucide-react";

// Child components
import DataSearch from "./DataSearch";
import ColumnVisibilityManager from "./ColumnVisibilityManager";
import TableFilters from "./TableFilters";
import TablePagination from "./TablePagination";
import MyTable from "./MyTable";

// ---------------------------------------------------------
// Multi-value filter function
// ---------------------------------------------------------
function multiValueFilterFn(row, columnId, filterValues) {
  if (!filterValues || filterValues.length === 0) {
    return true;
  }
  const rowValue = row.getValue(columnId);
  return filterValues.includes(String(rowValue));
}

export default function DataTable({ apiUrl, searchableField = "name" }) {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [loading, setLoading] = useState(true);

  // Table states
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  // Custom states to handle multiple-value filters
  const [selectedFilters, setSelectedFilters] = useState({});
  const [filterSearch, setFilterSearch] = useState({});

  // Pagination states
  const [pageSize, setPageSize] = useState(10); // rows per page
  const [paginationLinks, setPaginationLinks] = useState({
    next: null,
    previous: null,
    count: 0,
    currentPage: 1,
    totalPages: 1,
  });

  // -------------------------------------------------------
  // Fetch data
  // -------------------------------------------------------
  const fetchData = async (url) => {
    try {
      setLoading(true);
      const response = await fetch(url);
      const json = await response.json();

      setData(json.results || []);
      const totalPages = Math.ceil(json.count / pageSize);
      const currentPage = json.next
        ? Number(new URL(json.next).searchParams.get("page")) - 1
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
      if (json.results && json.results.length > 0) {
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
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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

  // -------------------------------------------------------
  // Initial data fetch on mount (and whenever pageSize changes)
  // -------------------------------------------------------
  useEffect(() => {
    fetchData(`${apiUrl}?page_size=${pageSize}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl, pageSize]);

  // -------------------------------------------------------
  // Navigation
  // -------------------------------------------------------
  const handleNavigate = (url) => {
    if (url) {
      fetchData(url);
    }
  };

  // -------------------------------------------------------
  // React Table instance
  // -------------------------------------------------------
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

  // -------------------------------------------------------
  // Handle filter reset
  // -------------------------------------------------------
  const handleResetFilters = () => {
    setSelectedFilters({});
    setFilterSearch({});
    setGlobalFilter("");
    table.setColumnFilters([]);
  };

  // -------------------------------------------------------
  // Handle toggling of filter values
  // -------------------------------------------------------
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

  // -------------------------------------------------------
  // Search within the dropdown filter list
  // -------------------------------------------------------
  const handleSearchDropdown = (field, text) => {
    setFilterSearch((prev) => ({ ...prev, [field]: text }));
  };

  // -------------------------------------------------------
  // Calculate how many results each filter option has
  // -------------------------------------------------------
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
      {/* Global Search & Reset */}
      <DataSearch
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        handleResetFilters={handleResetFilters}
      />

      {/* Column Visibility */}
      <ColumnVisibilityManager table={table} />

      {/* Filters */}
      <TableFilters
        table={table}
        filterOptions={filterOptions}
        selectedFilters={selectedFilters}
        handleToggleValue={handleToggleValue}
        filterSearch={filterSearch}
        handleSearchDropdown={handleSearchDropdown}
        calculateFilterCounts={calculateFilterCounts}
        setSelectedFilters={setSelectedFilters}
      />

      {/* The actual table */}
      <MyTable table={table} data={data} columns={columns} />

      {/* Pagination */}
      <TablePagination
        data={data}
        apiUrl={apiUrl}
        pageSize={pageSize}
        setPageSize={setPageSize}
        paginationLinks={paginationLinks}
        handleNavigate={handleNavigate}
        fetchData={fetchData}
      />
    </div>
  );
}
