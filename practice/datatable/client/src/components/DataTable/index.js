"use client";

import React from "react";
import DataTable from "./DataTable";

/**
 * This file simply re-exports the main DataTable component.
 * If you prefer, you can remove this file entirely and import 
 * DataTable directly from ./DataTable.
 */
export default function DynamicShadcnTable({ apiUrl, searchableField = "name" }) {
  return <DataTable apiUrl={apiUrl} searchableField={searchableField} />;
}
