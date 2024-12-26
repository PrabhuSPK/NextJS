"use client"
import React, { useState } from 'react'

const Page = () => {
    const [number,setNumber] = useState(0);
    // const [variable,update(2) fun] = useState();

    // let number = 1
    const add = () =>{
        // number = number+1;
        setNumber((a) =>{
            return a+1;
        })
        console.log(number)
    }

  return (
    <div>
        <h1>{number}</h1>
        <button onClick={add} className='bg-red-300 px-4 py-2 '>Add</button>
    </div>
  )
}

export default Page