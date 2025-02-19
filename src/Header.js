import React, { useState } from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';
import Profile from './Profile';

function Header({ onPlusClick, isAuthenticated, setIsAuthenticated, username, setUsername, profilePictureUrl }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername(null);
  };

  return (
    <header className="header">
      <div className="logo">
        <img src="https://sero.com/themes/sero/images/logo-sero-ems-group.svg" alt="Sero Logo" />
      </div>

      <div className="profile">
        {isAuthenticated && (
          <>
            <button className="button_plus" onClick={onPlusClick}>+</button>
            <img
              src={profilePictureUrl ? `http://localhost:3000${profilePictureUrl}` : "/images/profilimg.png"}
              alt="Profile"
              className="profile-picture"
              onClick={() => setShowProfileMenu(!showProfileMenu)} // Profilmenü umschalten
            />
            {showProfileMenu && (
              <div className="profile-menu">
                <Profile onUploadSuccess={(url) => {
                  setShowProfileMenu(false); // Menü schließen, wenn Upload fertig
                }} />
              </div>
            )}

            <span className="username-header">{username}</span>
            <button className="buttonLogout" onClick={handleLogout}>Logout</button>
          </>
        )}
        {!isAuthenticated && (
          <>
            <a href="/register">Register</a>
            <a href="/login">Login</a>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
