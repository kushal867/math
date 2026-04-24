import React from 'react';

const Navbar = () => {
  return (
    <nav className="navbar container">
      <div className="nav-logo">
        <div className="logo-icon"></div>
        <span className="logo-text">Naya <span>Yatra</span></span>
      </div>
      
      <div className="nav-links">
        <a href="#colleges">Find Colleges</a>
        <a href="#courses">Courses</a>
        <a href="#guidance">Guidance</a>
        <a href="#about">About</a>
      </div>

      <div className="nav-actions">
        <button className="btn-text">Sign In</button>
        <button className="btn-primary">Get Started</button>
      </div>
    </nav>
  );
};

export default Navbar;
