import React from 'react'
import {Link} from 'react-router-dom'
import './Navbar.css'

const Navbar = ({state,account}) => {
  return (
    <>
      <div className='Navbar'>
        <Link to="/">Home</Link>
        <Link to="/getfiles">Files</Link>
        <Link to="/sharefile">Share</Link>
      </div>
      <p className='accountNum'>Connected Account: {account}</p>
    </>
  )
}

export default Navbar
