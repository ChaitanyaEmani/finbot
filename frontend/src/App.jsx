import React, { useState } from 'react'
import { Routes,Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Dashboard from './pages/Dashboard/Dashboard'
import Navbar from './components/Navbar/Navbar'
import LoginSignup from './pages/LoginSignup/LoginSignup'

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <>
      {showLogin && <LoginSignup setShowLogin={setShowLogin} />}
      <div className="app">
        <Navbar
          showLogin={showLogin}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <Routes>
          <Route
            path="/"
            element={<Home setShowLogin={setShowLogin} />}
          />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
              />
            }
          />
        </Routes>
      </div>
    </>
  );
};

export default App