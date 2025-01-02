
"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import React from 'react'

const ToastProvider = ({ children }) => {
  return (
    <div>
    {children}
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="colored"
    />
    </div>
  )
}

export default ToastProvider


