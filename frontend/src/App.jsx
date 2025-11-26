// App.jsx
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Budget from './pages/Budget';
import Chat from './pages/Chat';
import Transaction from './pages/Transaction';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginSignup from './pages/LoginSignup';


const App = () => {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/login-signup' element={<LoginSignup/>}/>
        <Route path="/budget" element={<Budget />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/transaction" element={<Transaction />}/>
      </Routes>
      {!isChatPage && <Footer />}
    </>
  );
};

export default App;