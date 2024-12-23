import React from 'react'

const page = ({params}) => {
  return (
    <div>
        <h1>Your POST : {params.product[0]} / {params.product[1]} / {params.product[2]} / {params.product[3]}</h1>
    </div>
  )
}

export default page