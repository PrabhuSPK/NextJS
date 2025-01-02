"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Minimal example for deleting an existing record.
 *
 * Props:
 * - apiUrl: e.g. "http://127.0.0.1:8000/api/user/"
 * - recordId: e.g. 1 (the primary key of the record you're deleting)
 * - onSuccess: callback after successful delete
 * - onError: callback after an error
 */
export default function DeleteRecord({ apiUrl, recordId, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!recordId) return;
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}${recordId}/`, {
        method: "DELETE",
      });
      if (!response.ok && response.status !== 204) {
        // 204 = No Content (success on DELETE)
        throw new Error(`Delete failed with status ${response.status}`);
      }
      if (onSuccess) onSuccess(recordId);
    } catch (error) {
      console.error("Error deleting record:", error);
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  }

  if (!recordId) return <div>No record selected to delete.</div>;

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
      {loading ? "Deleting..." : "Delete"}
    </Button>
  );
}
