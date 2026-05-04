import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './components/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import App from './App.jsx'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Students from './components/Students'
import Classes from './components/Classes'
import Enrollments from './components/Enrollments'
import Grades from './components/Grades'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
          <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
          <Route path="/enrollments" element={<ProtectedRoute><Enrollments /></ProtectedRoute>} />
          <Route path="/grades" element={<ProtectedRoute><Grades /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  </StrictMode>,
)
