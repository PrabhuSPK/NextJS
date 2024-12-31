"use client"
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from 'next/link'

export default function Home() {

  const [posts,setPosts] = useState([]);
  const [search, setSearch] = useState(false)

  const inputSearch = useRef("");
  console.log("inputSearch::",inputSearch)
  console.log("output:;",inputSearch.current.value)
  
  const handleSearch =() =>{
    setSearch(true)

    setTimeout(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL+'/search/?q='+inputSearch.current.value)
    .then((response) => response.json() )
    .then( (response) => setPosts(response) )
    .finally(()=>{
      setSearch(false)
    }
    )
    }, 3000);
  }

  useEffect( () =>{
    console.log("test",process.env.NEXT_PUBLIC_API_URL)
    fetch(process.env.NEXT_PUBLIC_API_URL+'/posts')
    .then((response) => response.json() )
    .then( (response) => setPosts(response) )
  },[]
  );

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <main className="container mx-auto px-4 py-6">
        <h2 className="text-4xl font-bold mb-4">Welcome to Our Blog</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </main>

    <div className="flex justify-end">
        <input ref={inputSearch} disabled={search} type="text" className="px-4 py-2 border border-gray-300 rounded-md" placeholder="Search..." />
        <button onClick={handleSearch} disabled={search} className="px-4 py-2 bg-blue-500 text-white rounded-md ml-4">{search?"...":"Search"}</button>
      </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {posts.map((post) => (
      
      <Link key={post.id} href={'/posts/'+post.id}>
      <div key={post.id} className="border border-gray-200 p-4">
          <Image className="w-full h-48 object-cover mb-4" src="https://picsum.photos/200" alt="Post Image" width={100} height={100} priority={false}/>
          <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
          <p className="text-gray-600">{post.description}</p>
        </div>
      </Link>
     )
    )}

    {(!posts.length > 0) && inputSearch.current.value && <p>No Post Available : {inputSearch.current.value}</p>}
       
    </div>
    </div>
  );
}
