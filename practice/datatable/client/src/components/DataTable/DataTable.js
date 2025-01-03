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

// UI Components
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// Child Components
import DataSearch from "./DataSearch";
import ColumnVisibilityManager from "./ColumnVisibilityManager";
import TableFilters from "./TableFilters";
import TablePagination from "./TablePagination";
import DeleteDialog from "@/components/CRUD/Delete";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Converts snake_case or camelCase to Title Case
function formatHeader(header) {
    return header
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Add spaces before camelCase uppercase letters
      .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase()); // Capitalize the first letter of each word
  }

// Multi-value filter function
function multiValueFilterFn(row, columnId, filterValues) {
  if (!filterValues || filterValues.length === 0) {
    return true;
  }
  const rowValue = row.getValue(columnId);
  return filterValues.includes(String(rowValue));
}

export default function DataTable({ apiUrl }) {
  const router = useRouter();

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [filterSearch, setFilterSearch] = useState({});
  const [loading, setLoading] = useState(true);

  // Table states
  const [sorting, setSorting] = useState([]);
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
               {formatHeader(key)} 
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

  const handleToggleValue = (field, value, add, clear = false) => {
    setSelectedFilters((prevFilters) => {
      const newFilters = { ...prevFilters };

      if (clear) {
        // Clear all filters for the field
        newFilters[field] = [];
      } else {
        if (!newFilters[field]) newFilters[field] = [];
        if (add) {
          newFilters[field] = [...new Set([...newFilters[field], value])];
        } else {
          newFilters[field] = newFilters[field].filter((val) => val !== value);
        }
      }

      const col = table.getColumn(field);
      if (col) col.setFilterValue(newFilters[field]);

      return newFilters;
    });
  };

  const handleSearchDropdown = (field, searchText) => {
    setFilterSearch((prevOptions) => ({
      ...prevOptions,
      [field]: searchText,
    }));
  };

  const calculateFilterCounts = (field, value) => {
    return data.filter((row) => String(row[field]) === String(value)).length;
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    filterFns: {
      multiValue: multiValueFilterFn,
    },
    enableSortingRemoval: false,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const selectedRowCount = Object.keys(rowSelection).length;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center space-x-4 mb-4">
          <Button onClick={() => router.push("/create-user")}>Create</Button>
        {selectedRowCount > 0 && (
          <DeleteDialog
            rowSelection={rowSelection}
            apiUrl={apiUrl}
            pageSize={pageSize}
            fetchData={fetchData}
            setRowSelection={setRowSelection}
            table={table}
          />
        )}
      </div>


      <DataSearch
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        handleResetFilters={() => {
          setGlobalFilter("");
          setSelectedFilters({}); // Clear selected filters
          setFilterSearch({}); // Clear search filters
          table.setColumnFilters([]); // Reset table column filters
        }}
      />


      <TableFilters
        filterOptions={filterOptions}
        selectedFilters={selectedFilters}
        handleToggleValue={handleToggleValue}
        filterSearch={filterSearch}
        handleSearchDropdown={handleSearchDropdown}
        calculateFilterCounts={calculateFilterCounts}
        table={table}
        selectedRowCount={selectedRowCount}
      />

<div className="w-full">

      <Table className="border border-gray-200 rounded-lg overflow-hidden">
  <TableHeader className="bg-gray-50">
    {table.getHeaderGroups().map((headerGroup) => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <TableHead
            key={header.id}
            className="px-4 py-3 text-sm font-medium text-left border-b border-gray-200"
          >
            {header.isPlaceholder ? null : (
              <div className="flex items-center space-x-2">
                <span>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </span>
                {header.column.getCanSort() && (
                  <button
                    onClick={header.column.getToggleSortingHandler()}
                    className="flex items-center space-x-2 focus:outline-none"
                    type="button"
                  >
                    {header.column.getIsSorted() === "asc" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {header.column.getIsSorted() === "desc" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M14.707 10.707a1 1 0 00-1.414 0L10 14.586l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {header.column.getIsSorted() === false && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.707a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414zM14.707 12.293a1 1 0 00-1.414 0L10 15.172l-3.293-2.879a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            )}
          </TableHead>
        ))}
      </TableRow>
    ))}
  </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => router.push(`/details-user?id=${row.original.id}`)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200 whitespace-nowrap">
                    
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>


      <TablePagination
        data={data}
        apiUrl={apiUrl}
        pageSize={pageSize}
        setPageSize={setPageSize}
        paginationLinks={paginationLinks}
        handleNavigate={(url) => fetchData(url)}
        fetchData={fetchData}
        selectedRowCount={selectedRowCount}
      />
    </div>
  );
}
