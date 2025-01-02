"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronDown,
} from "lucide-react";

export default function TablePagination({
  data,
  apiUrl,
  pageSize,
  setPageSize,
  paginationLinks,
  handleNavigate,
  fetchData,
}) {
  return (
    <div className="flex items-center justify-between py-4 border-t mt-4">
      {/* Row Selection Info */}
      <div className="text-sm text-muted-foreground">
        0 of {data.length} row(s) selected.
      </div>

      {/* Rows Per Page Dropdown and Pagination Controls */}
      <div className="flex items-center gap-4">
        {/* Rows Per Page Dropdown */}
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

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(`${apiUrl}?page=1&page_size=${pageSize}`)}
            disabled={paginationLinks.currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNavigate(paginationLinks.previous)}
            disabled={!paginationLinks.previous}
          >
            <ChevronLeft className="h-4 w-4" />
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
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
