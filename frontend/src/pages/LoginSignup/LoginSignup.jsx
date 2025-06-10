import React, { useState } from 'react';
import './LoginSignup.css';
import axios from 'axios';

const LoginSignup = ({ setShowLogin }) => {
  const [currState, setCurrState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const API = import.meta.env.VITE_API_BASE_URL;
    const newurl = currState === "Sign Up" ? `${API}/api/user/register` : `${API}/api/user/login`;


    try {
      const res = await axios.post(newurl, {
        name,
        email,
        password
      });

      if (res.data.success) {
        // Store token in localStorage
        localStorage.setItem("token", res.data.token);
        setShowLogin(false);
        // Optionally redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again later.");
    }
  };

  return (
    <div className='loginsignup'>
      <form className="login-signup-container" onSubmit={handleSubmit}>
        <div className="login-signup-title">
          <h2>{currState}</h2>
          <p onClick={() => setShowLogin(false)}>X</p>
        </div>

        <div className="login-signup-inputs">
          {currState === "Sign Up" && (
            <input
              type="text"
              placeholder='Your name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">{currState === "Sign Up" ? "Sign up" : "Login"}</button>

        <div className="login-signup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>

        {error && <p className="error">{error}</p>}

        {currState === "Sign Up" ? (
          <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
        ) : (
          <p>Don't have an account? <span onClick={() => setCurrState("Sign Up")}>Sign up here</span></p>
        )}
      </form>
    </div>
  );
};

export default LoginSignup;
