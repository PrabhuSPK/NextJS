"use client";
import { useForm } from 'react-hook-form'

const Page = () => {
    const { register, handleSubmit} = useForm();
//  const onSubmit = data => console.log(data);

const onSubmit = (data)=>{
    fetch(process.env.NEXT_PUBLIC_API_URL+'/posts/',{
        method : "POST",
        headers:{
            "Content-Type":"application/json"},
        body: JSON.stringify(data)
 })
 };
  return (
    <div>
         <main className="container mx-auto px-4 py-6">
        <h2 className="text-4xl font-bold mb-4">Contact Us</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg">
            <div className="flex items-center mb-4">
                <label htmlFor="title" className="w-1/4">Title:</label>
                <input type="text" id="title" className="border rounded px-2 py-1 w-3/4" name="title" {...register("title")}/>
            </div>
            <div className="flex items-center mb-4">
                <label htmlFor="description" className="w-1/4">Description:</label>
                <input type="text" id="description" className="border rounded px-2 py-1 w-3/4" name="description" {...register("description")}/>
            </div>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Submit</button>
        </form>
    </main>
    </div>
  )
}

export default Page