"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

const Detail = ({ params }) => {
  const [post, setPost] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Await the params to resolve
        const resolvedParams = await params;
        const id = resolvedParams.id;

        // Fetch the post data
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`);
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    })();
  }, [params]);

  if (!post) {
    return <p>Loading...</p>;
  }

    return (
        <div>
            <main className="container mx-auto px-4 py-6">
            <h2 className="text-4xl font-bold mb-4">{post.title}</h2>
            {/* <p className="text-gray-500">Published on January 1, 2022</p> */}
            {/* <Image src="https://picsum.photos/200" alt="Post Image" className="my-4" width={100} height={200} /> */}
            <p>{post.description}</p>
        </main>
        </div>
      )
    }
    
    export default Detail