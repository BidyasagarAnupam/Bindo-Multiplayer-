import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import { NextUIProvider } from "@nextui-org/react";
import { Provider } from "react-redux";
import store from './redux/store.js';



createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <Toaster />
      <NextUIProvider>
        <main className="dark text-foreground bg-slate-800">
          <App />
        </main>
      </NextUIProvider>
    </BrowserRouter>
  </Provider>,
)
