import React from 'react'
import './Home.css'
import { Link } from 'react-router-dom'
import header from '../../assets/header.png'

const Home = ({setShowLogin}) => {
  return (
    <div className='home'>
        <div className="home-content">
          <div className="home-text">
            <h1>Instant Answers to All Your Financial Queries</h1>
            <p>Promotes quick and efficient assistance</p>
            <button onClick={()=>setShowLogin(true)}>Get Started</button>
          </div>
          <div className="image">
            <img src={header} alt="" />
          </div>
          
        </div>
    </div>
  )
}

export default Home