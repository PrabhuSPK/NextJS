import React from 'react'

const page = ({params}) => {
  return (
    <div>
        <h1>Your POST : {params.product}</h1>
    </div>
  )
}

export default page