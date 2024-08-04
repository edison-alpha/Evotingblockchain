import React, { useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Home from './Home'
import { AuthContext } from './context/AuthContext'
import Login from './Login'

// Komponen utama aplikasi
const App = () => {
    // Mengambil data currentUser dari AuthContext
    const { currentUser } = useContext(AuthContext)


    const ProtectedRoute = ({ children }) => {
        if (!currentUser) {
            return <Navigate to="/login" />
        }
        return children;
    };

    return (
        <div>
            <Routes>
                {/* Rute untuk halaman utama */}
                <Route path="/" element={
                    <Login />
                } />
                {/* Rute untuk halaman login */}
                <Route path='/Home' element={<Home/>} />
            </Routes>
        </div>
    )
}

export default App;
