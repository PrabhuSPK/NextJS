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
import { ArrowUpDown, ChevronDown } from "lucide-react"

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

// Multi-value filter function
function multiValueFilterFn(row, columnId, filterValues) {
  if (!filterValues || filterValues.length === 0) {
    return true
  }
  const rowValue = row.getValue(columnId)
  return filterValues.includes(String(rowValue))
}

export default function DynamicShadcnTable({ apiUrl, searchableField = "name" }) {
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [filterOptions, setFilterOptions] = useState({})
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})
  const [selectedFilters, setSelectedFilters] = useState({})
  const [filterSearch, setFilterSearch] = useState({})

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch(apiUrl)
        const json = await response.json()
        const tableData = json.results || []
        const opts = json.filter_options || {}
        setFilterOptions(opts)

        const builtColumns = []
        if (tableData.length > 0) {
          const keys = Object.keys(tableData[0])

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

          keys.forEach((key) => {
            builtColumns.push({
              accessorKey: key,
              filterFn: opts[key] ? "multiValue" : undefined,
              header: ({ column }) => (
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (!column.getIsSorted()) {
                      column.toggleSorting(false)
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

  // Apply selected filters to table column filters
  useEffect(() => {
    Object.keys(selectedFilters).forEach((field) => {
      const col = table.getColumn(field)
      if (col) {
        col.setFilterValue(selectedFilters[field] || [])
      }
    })
  }, [selectedFilters, table])

  const handleToggleValue = (field, value, checked) => {
    setSelectedFilters((prev) => {
      const existing = prev[field] || []
      let updated
      if (checked) {
        updated = existing.includes(value) ? existing : [...existing, value]
      } else {
        updated = existing.filter((v) => v !== value)
      }
      return { ...prev, [field]: updated }
    })
  }

  const handleResetFilters = () => {
    setSelectedFilters({})
    setFilterSearch({})
    table.setColumnFilters([]) // Reset column filters in TanStack Table
  }

  const handleSearchDropdown = (field, text) => {
    setFilterSearch((prev) => ({ ...prev, [field]: text }))
  }

  // Calculate counts for dropdown dynamically
  const calculateFilterCounts = (field, value) => {
    return table
      .getFilteredRowModel()
      .rows.filter((row) => String(row.original[field]) === value).length
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="w-full">
      {/* Search bar and Reset All Filters button */}
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder={`Search ${searchableField}...`}
          value={String(table.getColumn(searchableField)?.getFilterValue() || "")}
          onChange={(e) => table.getColumn(searchableField)?.setFilterValue(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={handleResetFilters}>
          Reset All Filters
        </Button>
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(filterOptions).map((field) => {
          const allValues = filterOptions[field] || []
          const selectedValues = selectedFilters[field] || []
          const searchText = filterSearch[field] || ""
          const displayedValues = allValues.filter((val) =>
            val.toLowerCase().includes(searchText.toLowerCase())
          )

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
                    const isChecked = selectedValues.includes(val)
                    const count = calculateFilterCounts(field, val)
                    return (
                      <DropdownMenuItem
                        key={val}
                        className="flex items-center gap-2 justify-between"
                        onSelect={(e) => {
                          e.preventDefault()
                          handleToggleValue(field, val, !isChecked)
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox checked={isChecked} />
                          <span>{val}</span>
                        </div>
                        <span className="text-muted-foreground">{count}</span>
                      </DropdownMenuItem>
                    )
                  })
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500"
                  onSelect={(e) => {
                    e.preventDefault()
                    setSelectedFilters((prev) => ({ ...prev, [field]: [] }))
                  }}
                >
                  Clear filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
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
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
    </div>
  )
}
