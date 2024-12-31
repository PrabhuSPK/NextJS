"use client";
import React from 'react'
import { useForm } from "react-hook-form";

const Contact = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const onSubmit = (data) =>{
        fetch(process.env.NEXT_PUBLIC_API_URL+'/posts/',{
            method : 'POST',
            headers : {
                'Content-Type':'application/json'
            },
            body : JSON.stringify(data)
    })

    }

  return (
    <div>
       <main className="container mx-auto px-4 py-6">
        <h2 className="text-4xl font-bold mb-4">Contact Us</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg">
            <div className="flex items-center mb-4">
                <label htmlFor="title" className="w-1/4">title:</label>
                <input type="text" id="title" className="border rounded px-2 py-1 w-3/4" 
                 {...register("title")} />
              
               
            </div>
            <div className="flex items-center mb-4">
                <label htmlFor="description" className="w-1/4">Email:</label>
                <input type="description" id="description" className="border rounded px-2 py-1 w-3/4"
              {...register("description")}
                 />
                
            </div>

            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Submit</button>
        </form>
    </main>
    </div>
  )
}

export default Contact