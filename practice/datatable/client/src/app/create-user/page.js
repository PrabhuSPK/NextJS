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
} from "@/components/ui/select"; // Adjust based on your library

export default function CreateUserPage() {
  const router = useRouter();
  const apiUrl = "http://127.0.0.1:8000/api/user/";
  const choicesUrl = "http://127.0.0.1:8000/api/user/choices/";

  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState([]);
  const [choices, setChoices] = useState({});
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchSchema();
    fetchChoices();
  }, []);

  async function fetchSchema() {
    try {
      const res = await fetch(apiUrl, { method: "OPTIONS" });
      if (!res.ok) {
        throw new Error(`OPTIONS request failed: ${res.status}`);
      }
      const meta = await res.json();
      const postFields = meta.actions?.POST || {};

      const fieldsArray = Object.keys(postFields)
        .filter((fieldName) => !["id", "created_at", "updated_at"].includes(fieldName))
        .map((fieldName) => ({
          name: fieldName,
          label: postFields[fieldName].label || fieldName,
          required: postFields[fieldName].required,
          type: postFields[fieldName].type || "string",
        }));

      setSchema(fieldsArray);

      const initialData = {};
      fieldsArray.forEach((field) => {
        initialData[field.name] = "";
      });
      setFormData(initialData);
    } catch (error) {
      console.error("Error fetching schema:", error);
      toast.error("Error loading form fields.");
    }
  }

  async function fetchChoices() {
    try {
      const res = await fetch(choicesUrl);
      if (!res.ok) {
        throw new Error(`Choices request failed: ${res.status}`);
      }
      const json = await res.json();
      setChoices(json);
    } catch (error) {
      console.error("Error fetching choices:", error);
      toast.error("Error loading choices.");
    }
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

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
        {schema.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {choices[field.name] ? (
              <Select
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, [field.name]: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={`Select ${field.label.toLowerCase()}`}
                    value={formData[field.name]}
                  />
                </SelectTrigger>
                <SelectContent>
                  {choices[field.name].map((choice) => (
                    <SelectItem key={choice} value={choice}>
                      {choice.charAt(0).toUpperCase() + choice.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                name={field.name}
                placeholder={field.label}
                value={formData[field.name] || ""}
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
