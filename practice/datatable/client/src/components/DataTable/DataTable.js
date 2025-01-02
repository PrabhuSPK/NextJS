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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const router = useRouter();

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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // 'single' or 'all'

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

  const handleDelete = async () => {
    try {
      if (deleteType === "single") {
        const internalRowId = Object.keys(rowSelection)[0];
        const dbRowId = table.getRowModel().rows.find(
          (row) => row.id === internalRowId
        )?.original?.id;

        if (dbRowId) {
          await fetch(`http://127.0.0.1:8000/api/user/${dbRowId}/`, {
            method: "DELETE",
          });
          console.log(`Deleted row with ID: ${dbRowId}`);
        }
      } else if (deleteType === "all") {
        const selectedIds = Object.keys(rowSelection)
          .map((rowId) =>
            table.getRowModel().rows.find((row) => row.id === rowId)?.original?.id
          )
          .filter((id) => id);

        if (selectedIds.length > 0) {
          await fetch("http://127.0.0.1:8000/api/user/delete/", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selectedIds }),
          });
          console.log(`Deleted rows with IDs: ${selectedIds.join(", ")}`);
        }
      }
      setIsDialogOpen(false);
      setRowSelection({});
      fetchData(`${apiUrl}?page_size=${pageSize}`); // Refresh the table data
    } catch (error) {
      console.error("Error deleting rows:", error);
    }
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

  const selectedRowCount = Object.keys(rowSelection).length;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center space-x-4 mb-4">
        {selectedRowCount === 1 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                onClick={() => {
                  setDeleteType("single");
                  setIsDialogOpen(true);
                }}
              >
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <p>Do you really want to delete this row?</p>
              <DialogFooter>
                <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {selectedRowCount > 1 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                onClick={() => {
                  setDeleteType("all");
                  setIsDialogOpen(true);
                }}
              >
                Delete All
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Confirm Bulk Deletion</DialogTitle>
              <p>Do you really want to delete all selected rows?</p>
              <DialogFooter>
                <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

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
