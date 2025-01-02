// components/CRUD/delete.js

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";

export default function DeleteDialog({
  rowSelection,
  apiUrl,
  pageSize,
  fetchData,
  setRowSelection,
  table,
}) {
  // Get the selected rows' database IDs
  const selectedIds = Object.keys(rowSelection)
    .filter((rowId) => rowSelection[rowId]) // Only selected rows
    .map((rowId) => table.getRowModel().rows.find((row) => row.id === rowId)?.original?.id) // Map to database IDs
    .filter(Boolean); // Remove any undefined IDs

  const selectedCount = selectedIds.length;

  const handleDelete = async () => {
    if (selectedCount === 0) {
      toast.error("No rows selected");
      return;
    }

    try {
      let response;
      if (selectedCount === 1) {
        // Single record deletion
        const recordId = selectedIds[0];
        response = await fetch(`${apiUrl}${recordId}/`, {
          method: "DELETE",
        });
      } else {
        // Multiple record deletion
        response = await fetch(`${apiUrl}delete/`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: selectedIds }),
        });
      }

      if (response.ok) {
        toast.success(
          selectedCount === 1
            ? "Row deleted successfully"
            : "Selected rows deleted successfully"
        );
        // Re-fetch data to reflect changes
        fetchData(`${apiUrl}?page_size=${pageSize}`);
        setRowSelection({});
      } else {
        toast.error("Failed to delete selected rows");
      }
    } catch (error) {
      console.error("Error deleting rows:", error);
      toast.error("Error deleting rows");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          {selectedCount > 1 ? "Delete All" : "Delete"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete{" "}
          {selectedCount > 1 ? "all selected rows" : "this row"}?
        </DialogDescription>
        <DialogFooter>
          <Button variant="ghost">Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
