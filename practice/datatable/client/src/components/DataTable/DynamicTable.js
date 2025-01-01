// Updated File: components/DataTable/DynamicTable.js
import React, { useEffect, useState } from "react";
import TablePagination from "@/components/DataTable/TablePagination";
import TableSearch from "@/components/DataTable/TableSearch";
import TableColumns from "@/components/DataTable/TableColumns";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";

export default function DynamicTable({ apiUrl, searchableField = "name" }) {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [paginationLinks, setPaginationLinks] = useState({
    next: null,
    previous: null,
    count: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [pageSize, setPageSize] = useState(10);
  const [globalFilter, setGlobalFilter] = useState("");

  const multiValueFilterFn = (row, columnId, filterValues) => {
    if (!filterValues || filterValues.length === 0) {
      return true;
    }
    const rowValue = row.getValue(columnId);
    return filterValues.includes(String(rowValue));
  };

  const fetchData = async (url) => {
    try {
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

      if (json.results.length > 0) {
        const keys = Object.keys(json.results[0]);
        const builtColumns = keys.map((key) => ({
          accessorKey: key,
          header: key.charAt(0).toUpperCase() + key.slice(1),
        }));
        setColumns(builtColumns);
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
    }
  };

  useEffect(() => {
    fetchData(`${apiUrl}?page_size=${pageSize}`);
  }, [apiUrl, pageSize]);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    filterFns: { multiValue: multiValueFilterFn },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full">
      <TableSearch
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        handleResetFilters={() => {
          setGlobalFilter("");
        }}
      />
      <TableColumns columns={columns} table={table} data={data} />
      <TablePagination
        apiUrl={apiUrl}
        paginationLinks={paginationLinks}
        fetchData={fetchData}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />
    </div>
  );
}
