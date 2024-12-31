import React, { Suspense } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Skeleton } from "@/components/ui/skeleton";
// import { Shell } from "@/components/shell";

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

async function fetchPosts(searchParams: Record<string, string | undefined>) {
  const filters = searchParams?.filters || "";

  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/posts/`);
  if (filters) {
    url.searchParams.append("filters", filters);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

export default async function Page({ searchParams }: PageProps) {
  const postsPromise = fetchPosts(searchParams);

  return (
    <Shell className="gap-2">
      <Suspense fallback={<Skeleton className="h-7 w-52" />}>
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Posts</h1>
          <p className="text-sm text-muted-foreground">
            Browse through the list of posts from the API.
          </p>
        </div>
      </Suspense>

      <Suspense
        fallback={
          <Skeleton className="h-10 w-full">
            <div className="h-12 bg-gray-200" />
          </Skeleton>
        }
      >
        <DataTable promises={postsPromise} />
      </Suspense>
    </Shell>
  );
}
