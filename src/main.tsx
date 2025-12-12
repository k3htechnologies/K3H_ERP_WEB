import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '../src/app/App'
import './index.css'
import { NetworkStatusWatcher } from "@/core/hooks/networkStatusWatcher";
import { ToastProvider } from '@/core/hooks/useToast'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
    <BrowserRouter>
    <NetworkStatusWatcher/>
      <App />
    </BrowserRouter>
    </ToastProvider>
  </React.StrictMode>,
)

