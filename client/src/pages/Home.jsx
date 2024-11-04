import React from 'react'
import  useDocumentTitle  from "../hooks/useDocumentTitle";

const Home = () => {
    useDocumentTitle("Home | Bingo");
  return (
    <div className='h-screen'>Home</div>
  )
}

export default Home