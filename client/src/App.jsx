import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'
import {Toaster} from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoutes.jsx'
import AppContext from './context/AppContext.jsx'

const App = () => {

  const { sessionLoading } = useContext(AppContext);

  if (sessionLoading) {
  return (
    <div className="flex justify-center items-center h-screen text-xl font-semibold">
      <span className="animate-spin border-4 border-t-transparent border-indigo-500 rounded-full w-10 h-10 mr-3"></span>
      Checking session...
    </div>
  );
}


  return (
    <div className="bg-[url('./src/assets/bgImage.svg')] bg-contain">
      <Toaster/>
      <Routes>
        <Route path='/' element={<ProtectedRoute><Home/></ProtectedRoute>} /> 
         <Route path='/login' element={<Login/>} /> 
        <Route path='/profile' element={<ProtectedRoute><Profile/></ProtectedRoute>} /> 
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App