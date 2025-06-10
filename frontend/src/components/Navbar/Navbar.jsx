import React from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const Navbar = ({ showLogin }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload(); // optional refresh
  };

  const isLoggedIn = !!localStorage.getItem("token"); // check if token exists

  return (
    <div className={showLogin ? "" : "navbar"}>
      <div className="navbar-container">
        <Link to="/" className="logo">
          <h2>FinBot</h2>
        </Link>

        {isLoggedIn && (
          <div className="profile-container">
            <FaUserCircle size={30} color="black" className="profile-icon" />
            <div className="logout-btn" onClick={handleLogout}>
              Logout
            </div>
          </div>
        )}
      </div>
      <hr />
    </div>
  );
};

export default Navbar;
