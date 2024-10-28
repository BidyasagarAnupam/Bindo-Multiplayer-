import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import { NextUIProvider } from "@nextui-org/react";


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Toaster />
    <NextUIProvider>
      <App />
    </NextUIProvider>
  </BrowserRouter>,
)
