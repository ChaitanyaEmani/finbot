import React, { useEffect, useState } from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import header from '../../assets/header.png';

const Home = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleClick = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      setShowLogin(true);
    }
  };

  return (
    <div className='home'>
      <div className="home-content">
        <div className="home-text">
          <h1>Instant Answers to All Your Financial Queries</h1>
          <p>Promotes quick and efficient assistance</p>
          <button onClick={handleClick}>
            {isLoggedIn ? "Chat with FinBot" : "Get Started"}
          </button>
        </div>
        <div className="image">
          <img src={header} alt="FinBot Header" />
        </div>
      </div>
    </div>
  );
};

export default Home;
