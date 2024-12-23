"use client"
import { useRouter } from 'next/navigation'
import React from 'react'



const Testpage = () => {

  const router = useRouter();

  const back = () =>{
    router.push('/dashboard/settings')
  }

  return (
    <div>
    <h1>Test page..</h1>
    <button className='bg-red-500 text-white px-4 py-2' onClick={back}>Back</button>
    </div>
  )
}

export default Testpage