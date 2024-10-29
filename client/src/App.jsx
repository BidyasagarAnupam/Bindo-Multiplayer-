import './App.css'
import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import CreateBoard from './pages/CreateBoard';
import NavBar from './components/common/Navbar';

const App = () => {



  return (
    <div className='dark:bg-slate-950 h-screen'>
      <NavBar />
      <Routes>
        <Route
          path="/"
          element={<Home/>}
        />
        <Route 
          path="/create-board"
          element={<CreateBoard/>}
        />

      </Routes>
    </div>
  );
};

export default App