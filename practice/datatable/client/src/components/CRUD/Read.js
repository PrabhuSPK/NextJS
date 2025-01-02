"use client";
import React, { useEffect, useState } from "react";

/**
 * Minimal example for reading (retrieving) records.
 * This can be for a list or a single record, 
 * depending on your usage (just change the URL).
 *
 * Props:
 * - apiUrl: e.g. "http://127.0.0.1:8000/api/user/" or "http://127.0.0.1:8000/api/user/1/"
 */
export default function ReadRecords({ apiUrl }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchRecords() {
    try {
      setLoading(true);
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Read failed with status ${response.status}`);
      }
      const data = await response.json();
      /**
       * If it's a list endpoint (like ModelViewSet list), 
       * data might be { results: [...], count: XX }. Adjust accordingly.
       */
      setRecords(data.results ? data.results : Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error("Error reading records:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecords();
  }, [apiUrl]);

  if (loading) return <div>Loading...</div>;
  if (!records.length) return <div>No records found.</div>;

  return (
    <ul>
      {records.map((item) => (
        <li key={item.id}>
          {item.username} - {item.email}
        </li>
      ))}
    </ul>
  );
}
