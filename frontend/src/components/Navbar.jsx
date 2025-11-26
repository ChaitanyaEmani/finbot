import React, { useState, useEffect } from 'react';
import { Link, useLocation,useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';


const Navbar = () => {
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    
    // Dispatch event for other components
    window.dispatchEvent(new Event("authChange"));
    
    // Redirect to home
    window.location.href = "/";
  };



  return (
    <>
      <nav className="fixed top-0 p-1 w-full bg-slate-900/80 backdrop-blur-md z-50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">SaveUp</span>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-8">

              {/* When NOT logged in - show Home, Features, How It Works */}
              {!token ? (
                <>
                  <a href="/" className="text-gray-300 hover:text-white transition">
                    Home
                  </a>
                  <a href="#features" className="text-gray-300 hover:text-white transition">
                    Features
                  </a>
                  <a href="#how-it-works" className="text-gray-300 hover:text-white transition">
                    How It Works
                  </a>
                  <button
                    onClick={() => navigate('/login-signup')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105"
                  >
                    Get Started
                  </button>
                </>
              ) : (
                /* When logged in - show Budget, Transactions, AI Chat, Logout */
                <>
                  <Link
                    to="/"
                    className={`transition ${
                      location.pathname === "/" ? "text-white" : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/budget"
                    className={`transition ${
                      location.pathname === "/budget" ? "text-white" : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Budget
                  </Link>

                  <Link
                    to="/transaction"
                    className={`transition ${
                      location.pathname === "/transaction" ? "text-white" : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Transactions
                  </Link>

                  <Link
                    to="/chat"
                    className={`transition ${
                      location.pathname === "/chat" ? "text-white" : "text-gray-300 hover:text-white"
                    }`}
                  >
                    AI Chat
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;