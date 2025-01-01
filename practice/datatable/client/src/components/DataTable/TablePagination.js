// File: components/DataTable/TablePagination.js
import React from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function TablePagination({
  apiUrl,
  paginationLinks,
  fetchData,
  pageSize,
  setPageSize,
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-sm text-muted-foreground">
        Showing {paginationLinks.currentPage} of {paginationLinks.totalPages} rows.
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
          onClick={() => fetchData(paginationLinks.previous)}
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
          onClick={() => fetchData(paginationLinks.next)}
          disabled={!paginationLinks.next}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            fetchData(`${apiUrl}?page=${paginationLinks.totalPages}&page_size=${pageSize}`)
          }
          disabled={paginationLinks.currentPage === paginationLinks.totalPages}
        >
          Last
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="border p-2 rounded-md"
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
