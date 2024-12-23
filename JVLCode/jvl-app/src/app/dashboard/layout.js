import React from 'react'

const Layout = ({children}) => {
  return (
    <div>
        <h1>Dashboard Layout</h1>
        <h2>header</h2>
        {children}
        <h2>footer</h2>

    </div>
  )
}

export default Layout