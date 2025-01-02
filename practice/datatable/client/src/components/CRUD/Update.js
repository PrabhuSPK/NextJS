"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Minimal example for updating an existing record.
 *
 * Props:
 * - apiUrl: e.g. "http://127.0.0.1:8000/api/user/"
 * - recordId: e.g. 1 (the primary key of the record you're editing)
 * - onSuccess: callback after successful update
 * - onError: callback after an error
 */
export default function UpdateRecord({ apiUrl, recordId, onSuccess, onError }) {
  const [formData, setFormData] = useState({ username: "", email: "" });
  const [loading, setLoading] = useState(false);

  // Fetch existing record to populate form
  useEffect(() => {
    if (!recordId) return;
    async function fetchRecord() {
      try {
        const response = await fetch(`${apiUrl}${recordId}/`);
        if (!response.ok) {
          throw new Error(`Failed to fetch record with status ${response.status}`);
        }
        const data = await response.json();
        // Populate fields as needed
        setFormData({
          username: data.username || "",
          email: data.email || "",
        });
      } catch (error) {
        console.error("Error fetching record:", error);
      }
    }
    fetchRecord();
  }, [apiUrl, recordId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}${recordId}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error(`Update failed with status ${response.status}`);
      }
      const data = await response.json();
      if (onSuccess) onSuccess(data);
    } catch (error) {
      console.error("Error updating record:", error);
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!recordId) return <div>No record selected to update.</div>;

  return (
    <form onSubmit={handleUpdate} className="flex flex-col gap-2">
      <Input
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
      />
      <Input
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />
      {/* Additional fields as needed */}
      <Button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update"}
      </Button>
    </form>
  );
}
