"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function DetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recordId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchRecord();
  }, []);

  const fetchRecord = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/user/${recordId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch record: ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching record", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Skeleton className="w-3/4 h-8 mb-4" />
        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-1/2 h-4" />
      </div>
    );

  if (!data) {
    return (
      <Alert variant="destructive" className="mt-8">
        <AlertTitle>No Data Available</AlertTitle>
        <AlertDescription>The record could not be found or is unavailable.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Offer ID: {recordId}</CardTitle>
          <Button onClick={() => router.push(`/update-user?id=${recordId}`)}>Edit</Button>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-200">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="flex justify-between py-4">
                <span className="font-bold text-gray-600 capitalize">{key.replace(/_/g, " ")}</span>
                <span className="text-gray-800">{value !== null && value !== undefined ? String(value) : "N/A"}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
