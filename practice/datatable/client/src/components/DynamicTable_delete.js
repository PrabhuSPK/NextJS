"use client"
import React, { useEffect, useState } from "react";
import { DataTable } from "./DataTable";

const DynamicTable = ({ modelName, apiBaseUrl }) => {
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTableData() {
      try {
        setLoading(true);

        // Fetch data from the API
        const response = await fetch(`${apiBaseUrl}/${modelName}/`);
        const result = await response.json();

        // Extract data from the "results" key
        const tableData = result.results || []; // Ensure it's an array

        // Create dynamic columns from the first record in "results"
        const dynamicColumns = tableData[0]
          ? Object.keys(tableData[0]).map((key) => ({
              accessorKey: key,
              header: key.charAt(0).toUpperCase() + key.slice(1),
            }))
          : [];

        setColumns(dynamicColumns);
        setData(tableData);
      } catch (error) {
        console.error("Error fetching table data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTableData();
  }, [modelName, apiBaseUrl]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default DynamicTable;
