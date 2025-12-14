import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '../src/app/App'
import './index.css'
import { NetworkStatusWatcher } from "@/core/hooks/networkStatusWatcher";
import { ToastProvider } from '@/core/hooks/useToast'
import { ProjectProvider } from './features/projectMaster/context/ProjectContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <ProjectProvider>
        <BrowserRouter>
          <NetworkStatusWatcher />
          <App />
        </BrowserRouter>
      </ProjectProvider>
    </ToastProvider>
  </React.StrictMode>,
)

