"use client"
import { useRouter } from 'next/navigation'
import React from 'react'


const Settings = () => {
  const router = useRouter();

  const back = () =>{
    router.push('/dashboard')
  }

  return (
    <div>

        <h1>Settings Page</h1>
      <button className='bg-red-500 text-white px-4 py-2' onClick={back}>Back</button>


    </div>
  )
}

export default Settings