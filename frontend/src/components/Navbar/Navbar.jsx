import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import "./Navbar.css";
import axios from 'axios'
const Navbar = ({ showLogin, toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        await axios.post("http://localhost:5000/api/user/logout", { // replace with your API route
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Remove token and user info from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Navigate to home page
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className={showLogin ? "" : "navbar"}>
      <div className="navbar-container">
        {isSidebarOpen ? (
          <FaTimes className="hamburger" onClick={toggleSidebar} />
        ) : (
          <FaBars className="hamburger" onClick={toggleSidebar} />
        )}

        <Link to="/" className="logo">
          <h2>FinBot</h2>
        </Link>

        {isLoggedIn && (
          <div className="profile-container">
            <FaUserCircle
              size={30}
              className="profile-icon"
              onClick={handleLogout} // call API logout here
            />
          </div>
        )}
      </div>
      <hr />
    </div>
  );
};

export default Navbar;
