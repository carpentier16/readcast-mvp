import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <h1>ReadCast</h1>
        <nav>
          <ul>
            <li><a href="#upload">Upload</a></li>
            <li><a href="#voice">Voice</a></li>
            <li><a href="#projects">Projects</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
