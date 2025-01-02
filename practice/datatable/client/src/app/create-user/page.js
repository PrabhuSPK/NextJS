"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Adjust based on your UI library
import { Checkbox } from "@/components/ui/checkbox"; // Use Checkbox from your UI library or native HTML

export default function CreateUserPage() {
  const router = useRouter();
  const apiUrl = "http://127.0.0.1:8000/api/user/"; // DRF endpoint

  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState({});
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchSchema();
  }, []);

  /**
   * Fetch DRF schema using the `OPTIONS` method
   */
  async function fetchSchema() {
    try {
      const res = await fetch(apiUrl, { method: "OPTIONS" });
      if (!res.ok) {
        throw new Error(`OPTIONS request failed: ${res.status}`);
      }
      const metadata = await res.json();
      const fields = metadata.actions?.POST || {};

      // Filter out read-only fields
      const filteredFields = Object.keys(fields).reduce((acc, fieldName) => {
        if (!fields[fieldName].read_only) {
          acc[fieldName] = fields[fieldName];
        }
        return acc;
      }, {});

      // Initialize formData for non-read-only fields
      const initialData = {};
      Object.keys(filteredFields).forEach((fieldName) => {
        initialData[fieldName] =
          filteredFields[fieldName].type === "boolean" ? false : ""; // Default boolean to false
      });

      setFormData(initialData);
      setSchema(filteredFields);
    } catch (error) {
      console.error("Error fetching schema:", error);
      toast.error("Failed to load form schema.");
    }
  }

  /**
   * Handle input changes
   */
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleCheckboxChange(fieldName, value) {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  }

  /**
   * Submit the form
   */
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
      toast.success("Record created successfully!");
      router.push("/users");
    } catch (error) {
      console.error("Error creating record:", error);
      toast.error("Failed to create record.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Create User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.entries(schema).map(([fieldName, field]) => (
          <div key={fieldName}>
            <label className="block text-sm font-medium mb-1">
              {field.label || fieldName} {field.required && <span className="text-red-500">*</span>}
            </label>
            {/* Render dropdown for choice fields */}
            {field.type === "choice" ? (
              <Select
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, [fieldName]: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={`Select ${field.label || fieldName}`}
                    value={formData[fieldName]}
                  />
                </SelectTrigger>
                <SelectContent>
                  {field.choices.map((choice) => (
                    <SelectItem key={choice.value} value={choice.value}>
                      {choice.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === "boolean" ? (
              // Render checkbox for boolean fields
              <Checkbox
                checked={formData[fieldName]}
                onCheckedChange={(value) => handleCheckboxChange(fieldName, value)}
              >
                {field.label || fieldName}
              </Checkbox>
            ) : (
              // Render input for all other fields
              <Input
                name={fieldName}
                placeholder={field.label || fieldName}
                value={formData[fieldName]}
                onChange={handleChange}
              />
            )}
          </div>
        ))}
        <div className="flex items-center justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => router.push("/users")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
}
