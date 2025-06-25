import React from "react";
import { Link } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa"; // added FaTimes
import "./Navbar.css";

const Navbar = ({ showLogin, toggleSidebar, isSidebarOpen }) => {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className={showLogin ? "" : "navbar"}>
      <div className="navbar-container">
        {/* Toggle icon: hamburger or close */}
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
            <FaUserCircle size={30} className="profile-icon" />
          </div>
        )}
      </div>
      <hr />
    </div>
  );
};

export default Navbar;
