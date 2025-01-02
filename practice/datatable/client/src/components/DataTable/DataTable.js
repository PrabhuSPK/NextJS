"use client";

import React, { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";

// UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";

// Child components
import DataSearch from "./DataSearch";
import ColumnVisibilityManager from "./ColumnVisibilityManager";
import TableFilters from "./TableFilters";
import TablePagination from "./TablePagination";

// Multi-value filter function (unchanged)
function multiValueFilterFn(row, columnId, filterValues) {
  if (!filterValues || filterValues.length === 0) {
    return true;
  }
  const rowValue = row.getValue(columnId);
  return filterValues.includes(String(rowValue));
}

export default function DataTable({ apiUrl }) {
  const router = useRouter(); // for navigation

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

  // Pagination
  const [pageSize, setPageSize] = useState(10);
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

      setData(json.data || []);

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

      const opts = json.filter_options || {};
      setFilterOptions(opts);

      const builtColumns = [];
      if (json.data && json.data.length > 0) {
        const keys = Object.keys(json.data[0]);

        // Add checkbox selection column
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
              onClick={(e) => e.stopPropagation()} // Prevents propagation of click event to the row
              aria-label="Select row"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        });

        // Build dynamic columns
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      <Button onClick={() => router.push("/create-user")}>Create</Button>

      <DataSearch
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        handleResetFilters={() => {
          setGlobalFilter("");
          table.setColumnFilters([]);
        }}
      />

      <ColumnVisibilityManager table={table} />

      <TableFilters
        table={table}
        filterOptions={filterOptions}
        selectedFilters={{}}
        handleToggleValue={() => {}}
        filterSearch={{}}
        handleSearchDropdown={() => {}}
        calculateFilterCounts={() => 0}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="border-b px-4 py-2 text-left">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => router.push(`/details-user?id=${row.original.id}`)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border-b px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
