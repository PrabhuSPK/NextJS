"use client"

import React from "react"
// import DynamicShadcnTable from "@/components/DynamicShadcnTable"
import DynamicShadcnTable from "@/components/DataTable";

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Admin Dashboard</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Users</h2>
        <DynamicShadcnTable
          apiUrl="http://127.0.0.1:8000/api/user/"
          searchableField="id"
        />
      </section>

      {/* <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Products</h2>
        <DynamicShadcnTable
          apiUrl="http://127.0.0.1:8000/api/products/"
          searchableField="name"
        />
      </section> */}

   
      
    </div>
  )
}
