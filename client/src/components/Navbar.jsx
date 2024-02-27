import React from 'react'
import {Link, useLocation} from 'react-router-dom'
import './Navbar.css'

const Navbar = ({account}) => {
  const location = useLocation();

  const isActiveLink = (path) => {
    
    return location.pathname === path;
  }
  return (
    <>
      <div className='Navbar'>
        <Link to="/" className={isActiveLink('/')?"active":""}>Home</Link>
        <Link to="/getfiles" className={isActiveLink('/getfiles')?"active":""}>Files</Link>
        <Link to="/sharefile" className={isActiveLink(`/sharefile`)?'active':""}>Share</Link>
      </div>
      <p className='accountNum'>Connected Account: {account}</p>
    </>
  )
}

export default Navbar
