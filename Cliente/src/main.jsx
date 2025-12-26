import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import App from './App.jsx'
import store from './store'
import './index.css'
import { enableDebugMode } from './utils/debug'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Habilitar modo debug solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  enableDebugMode();
  console.log('🔧 Ejecutando en modo desarrollo');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
