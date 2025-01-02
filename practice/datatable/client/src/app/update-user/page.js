"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function UpdateUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const apiUrl = `http://127.0.0.1:8000/api/user/${userId}/`;

  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState({});
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchSchema();
    fetchUserData();
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
      const fields = metadata.actions?.PUT || {};

      // Process fields to include choices and initialize formData
      const processedFields = Object.keys(fields).reduce((acc, fieldName) => {
        if (!fields[fieldName].read_only) {
          acc[fieldName] = {
            ...fields[fieldName],
            value: fields[fieldName].type === "boolean" ? false : "",
            choices: fields[fieldName].choices || [],
          };
        }
        return acc;
      }, {});

      setSchema(processedFields);
      const initialFormData = Object.keys(processedFields).reduce((acc, key) => {
        acc[key] = processedFields[key].value;
        return acc;
      }, {});

      setFormData(initialFormData);
    } catch (error) {
      console.error("Error fetching schema:", error);
      toast.error("Failed to load form schema.");
    }
  }

  /**
   * Fetch existing user data
   */
  async function fetchUserData() {
    try {
      const res = await fetch(apiUrl, { method: "GET" });
      if (!res.ok) {
        throw new Error(`Failed to fetch user data: ${res.status}`);
      }
      const data = await res.json();
      setFormData((prev) => ({ ...prev, ...data })); // Merge user data into formData
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data.");
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        throw new Error(`Update failed with status ${res.status}`);
      }
      toast.success("Record updated successfully!");
      router.push("/users");
    } catch (error) {
      console.error("Error updating record:", error);
      toast.error("Failed to update record.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Update User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.entries(schema).map(([fieldName, field]) => (
          <div key={fieldName}>
            <label className="block text-sm font-medium mb-1">
              {field.label || fieldName} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === "choice" ? (
              <Select
                value={formData[fieldName]} // Ensure the dropdown shows the selected value
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
                      {choice.display_name || choice.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === "boolean" ? (
              <Checkbox
                checked={!!formData[fieldName]} // Ensure checkbox reflects boolean state
                onCheckedChange={(value) => handleCheckboxChange(fieldName, value)}
              >
                {field.label || fieldName}
              </Checkbox>
            ) : (
              <Input
                name={fieldName}
                placeholder={field.label || fieldName}
                value={formData[fieldName] || ""} // Ensure a default value is provided
                onChange={handleChange}
              />
            )}
          </div>
        ))}
        <div className="flex items-center justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => router.push("/users")}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </div>
  );
}
