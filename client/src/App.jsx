import './App.css'
import React, { Suspense, lazy, } from 'react'
import { Routes, Route } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Home = lazy(() => import('./pages/Home'));
const CreateBoard = lazy(() => import('./pages/CreateBoard'));
const NavBar = lazy(() => import('./components/common/Navbar'));
const AllBoards = lazy(() => import('./pages/AllBoards'));

const App = () => {



  return (
    <Suspense fallback={
      <DotLottieReact
        src="https://lottie.host/753b35a4-05c3-49ea-bc26-6e7b6832df98/54SX878Rgh.json"
        loop
        autoplay
      />
    }>
      <div className='dark:bg-slate-950 h-auto'>
        <NavBar />
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />
          <Route
            path="/create-board"
            element={<CreateBoard />}
          />
          <Route
            path="/all-boards"
            element={<AllBoards />}
          />
        </Routes>
      </div>
    </Suspense>
  );
};

export default App