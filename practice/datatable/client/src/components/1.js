"use client"

import React, { useEffect, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/**
 * 1) A single multi-value filter function for ANY field.
 *    If the user has selected values, we only allow rows whose value is in that array.
 */
function multiValueFilterFn(row, columnId, filterValues) {
  if (!filterValues || filterValues.length === 0) {
    return true
  }
  const rowValue = row.getValue(columnId)
  return filterValues.includes(String(rowValue))
}

/**
 * The main component
 */
export default function DynamicShadcnTable({ apiUrl, searchableField = "name" }) {
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])

  // Entire JSON response might have { results, filter_options }
  const [filterOptions, setFilterOptions] = useState({}) 
  // Example: { category: ["ifgdfg", "uhb", "vb"], status: [...], manufacturer: [...] }

  const [loading, setLoading] = useState(true)

  // TanStack Table states
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})

  /**
   * 2) Track user-selected filters for each field, e.g.
   *    selectedFilters = { category: ["ifgdfg"], status: ["ihbi"], ... }
   */
  const [selectedFilters, setSelectedFilters] = useState({})

  /**
   * 3) Track local search text per field for filtering the checkboxes in the dropdown.
   *    e.g. filterSearch["category"] = "if"
   */
  const [filterSearch, setFilterSearch] = useState({})

  // ----------------------------------------------------------------
  // Fetch data from API
  // ----------------------------------------------------------------
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch(apiUrl)
        const json = await response.json()

        // Expecting { results: [...], filter_options: {...} }
        const tableData = json.results || []
        const opts = json.filter_options || {}
        setFilterOptions(opts)

        // Build columns from the first row of results
        const builtColumns = []
        if (tableData.length > 0) {
          const keys = Object.keys(tableData[0])

          // 'Select' column for row selection
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
          })

          // Create a column for each field
          keys.forEach((key) => {
            builtColumns.push({
              accessorKey: key,
              // if the field is in filter_options, apply multiValue filter
              filterFn: opts[key] ? "multiValue" : undefined,

              header: ({ column }) => (
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (!column.getIsSorted()) {
                      column.toggleSorting(false) // asc
                    } else {
                      column.toggleSorting()
                    }
                  }}
                  className="px-0"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
              ),
              cell: ({ row }) => {
                const value = row.getValue(key)
                return value == null ? "—" : String(value)
              },
            })
          })

          // Example 'Actions' column
          builtColumns.push({
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
              const originalItem = row.original
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => navigator.clipboard.writeText(originalItem.id)}
                    >
                      Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            },
          })
        }

        setColumns(builtColumns)
        setData(tableData)
      } catch (error) {
        console.error("Error fetching table data:", error)
        setData([])
        setColumns([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [apiUrl])

  // ----------------------------------------------------------------
  // Setup TanStack Table
  // ----------------------------------------------------------------
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    filterFns: {
      multiValue: multiValueFilterFn,
    },
    enableSortingRemoval: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  // ----------------------------------------------------------------
  // Apply selectedFilters to each column in filter_options
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!filterOptions) return
    Object.keys(filterOptions).forEach((field) => {
      const col = table.getColumn(field)
      if (col) {
        col.setFilterValue(selectedFilters[field] || [])
      }
    })
  }, [selectedFilters, filterOptions, table])

  // ----------------------------------------------------------------
  // Searching a single text field (e.g. "name", "email")
  // ----------------------------------------------------------------
  const handleSearch = (e) => {
    const value = e.target.value
    // If your table has a column with accessorKey=searchableField
    table.getColumn(searchableField)?.setFilterValue(value)
  }

  // ----------------------------------------------------------------
  // Toggle an item (checkbox) for a given field
  // ----------------------------------------------------------------
  const handleToggleValue = (field, value, checked) => {
    setSelectedFilters((prev) => {
      const existing = prev[field] || []
      let updated
      if (checked) {
        // add
        updated = existing.includes(value) ? existing : [...existing, value]
      } else {
        // remove
        updated = existing.filter((v) => v !== value)
      }
      return { ...prev, [field]: updated }
    })
  }

  // ----------------------------------------------------------------
  // Keep local search text for each field's dropdown
  // ----------------------------------------------------------------
  const handleSearchDropdown = (field, text) => {
    setFilterSearch((prev) => ({ ...prev, [field]: text }))
  }

  // ----------------------------------------------------------------
  // Reset ALL filters (and local search text)
  // ----------------------------------------------------------------
  const handleResetFilters = () => {
    setSelectedFilters({})
    setFilterSearch({})
  }

  // Optional "Clear" that could remove filter constraints but keep typed text 
  // or do something else—this is just an example
  const handleClearOneField = (field) => {
    setSelectedFilters((prev) => ({ ...prev, [field]: [] }))
    setFilterSearch((prev) => ({ ...prev, [field]: "" }))
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="w-full">
      {/* Search bar & reset button */}
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder={`Search ${searchableField}...`}
          value={String(table.getColumn(searchableField)?.getFilterValue() || "")}
          onChange={handleSearch}
          className="max-w-sm"
        />

        {/* Example: a button to reset ALL filters */}
        <Button variant="outline" onClick={handleResetFilters}>
          Reset All Filters
        </Button>

        {/* Column Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const visible = column.getIsVisible()
                return (
                  <DropdownMenuItem
                    key={column.id}
                    className="flex items-center gap-2"
                    onSelect={(event) => {
                      event.preventDefault() // Keep menu open
                      column.toggleVisibility()
                    }}
                  >
                    <Checkbox checked={visible} />
                    <span className="capitalize">{column.id}</span>
                  </DropdownMenuItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* For each field in filter_options, build a filter dropdown */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(filterOptions).map((field) => {
          const allValues = filterOptions[field] || []
          const selectedValues = selectedFilters[field] || []
          const searchText = filterSearch[field] || ""
          // Filter the dropdown items by local search text
          const displayedValues = allValues.filter((val) =>
            val.toLowerCase().includes(searchText.toLowerCase())
          )

          return (
            <DropdownMenu key={field}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Filter {field.charAt(0).toUpperCase() + field.slice(1)}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>{field.toUpperCase()}</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Search box inside the dropdown */}
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

                {/* Checkboxes for each distinct value */}
                {displayedValues.length === 0 ? (
                  <DropdownMenuItem>No {field} found</DropdownMenuItem>
                ) : (
                  displayedValues.map((val) => {
                    const isChecked = selectedValues.includes(val)
                    return (
                      <DropdownMenuItem
                        key={val}
                        className="flex items-center gap-2"
                        onSelect={(event) => {
                          // Prevent closing
                          event.preventDefault()
                          handleToggleValue(field, val, !isChecked)
                        }}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleToggleValue(field, val, checked)
                          }
                        />
                        <span>{val}</span>
                      </DropdownMenuItem>
                    )
                  })
                )}

                {/* Optional "Clear" button for this field */}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    handleClearOneField(field)
                  }}
                >
                  Clear {field}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        })}
      </div>

      {/* Main Table */}
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
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination & selection info */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
