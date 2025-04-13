import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Account/Sidebar'

const Account = () => {
  // this is for sidebar
  const [isOpen, setIsOpen] = useState(true);  

  return (
    <div className=" min-h-[calc(100vh-5rem)] relative">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="h-[calc(100vh-4rem)] flex-1 overflow-auto ">
        <div className={`mx-auto ${isOpen ? "ml-[250px] w-10/12" : " mx-auto w-10/12"} py-10 h-[calc(100%-2.25rem)]`}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Account