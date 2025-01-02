"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// If you're using shadcn/ui for dialogs, adjust as needed:
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

/**
 * CreateModal
 * 
 * Usage:
 * <CreateModal apiUrl="http://127.0.0.1:8000/api/user/" onSuccess={refreshTable} />
 * 
 * Props:
 * - apiUrl      : DRF endpoint, e.g., "http://127.0.0.1:8000/api/user/"
 * - onSuccess() : Callback after a successful create (e.g., fetch new data)
 */
export default function CreateModal({ apiUrl, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [schema, setSchema] = useState([]);      // Fields from DRF OPTIONS
  const [formData, setFormData] = useState({});  // Values for each field
  const [loading, setLoading] = useState(false);

  // 1) Fetch DRF schema from OPTIONS to dynamically build form fields
  async function fetchSchema() {
    try {
      const res = await fetch(apiUrl, { method: "OPTIONS" });
      if (!res.ok) {
        throw new Error(`OPTIONS request failed with status ${res.status}`);
      }
      const meta = await res.json();
      const postFields = meta.actions?.POST || {};

      // Convert the object to an array so we can map over it easily
      const schemaArray = Object.keys(postFields).map((fieldName) => ({
        name: fieldName,
        label: postFields[fieldName].label || fieldName,
        required: postFields[fieldName].required,
        type: postFields[fieldName].type,  // e.g. "string", "integer", ...
        // ... or other metadata (help_text, max_length, etc.)
      }));
      setSchema(schemaArray);

      // Build initial form data object with empty strings
      const initialData = {};
      schemaArray.forEach((field) => {
        initialData[field.name] = "";
      });
      setFormData(initialData);

    } catch (error) {
      console.error("Error fetching create schema:", error);
    }
  }

  // 2) Open modal => fetch schema
  function handleOpenChange(nextOpen) {
    setOpen(nextOpen);
    if (nextOpen) {
      fetchSchema();
    } else {
      // Reset or keep form state if you prefer
      setSchema([]);
      setFormData({});
      setLoading(false);
    }
  }

  // 3) Handle field input changes
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // 4) Submit form => create new record
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        throw new Error(`Create failed with status ${res.status}`);
      }
      // Successfully created => close modal, run onSuccess to refresh table
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating record:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Create</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Record</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {schema.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <Input
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                // If you want to handle field.type differently, you could do:
                // type={field.type === "integer" ? "number" : "text"}
                placeholder={field.label}
              />
            </div>
          ))}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
