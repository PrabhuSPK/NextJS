// components/CRUD/delete.js

import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "react-toastify";

export default function DeleteDialog({ rowSelection, apiUrl, pageSize, fetchData, setRowSelection }) {
  const handleDelete = async () => {
    const selectedIds = Object.keys(rowSelection).filter((rowId) => rowSelection[rowId]);

    if (selectedIds.length === 0) {
      toast.error("No rows selected");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (response.ok) {
        toast.success("Selected rows deleted successfully");
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
        {/* Pass Button as child to DialogTrigger, so it doesn't get wrapped in another button */}
        <Button onClick={handleDelete}>Delete Selected</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete the selected rows?
        </DialogDescription>
        <DialogFooter>
          <Button variant="ghost">Cancel</Button>
          <Button onClick={handleDelete}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
