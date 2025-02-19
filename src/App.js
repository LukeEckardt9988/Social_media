// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import Main from './Main';  // Nur einmal importieren
import './App.css';
import Login from './Login';
import Register from './Register';
import CreatePost from './CreatePost';
import Profile from './Profile';


function App() {
  const [aktiveSeite, setAktiveSeite] = useState('Main');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);


  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
      const storedProfilePictureUrl = localStorage.getItem('profilePictureUrl');
      if (storedProfilePictureUrl) {
        setProfilePictureUrl(storedProfilePictureUrl);
      }
    }
  }, []);

  const toggleCreatePost = () => {
    setShowCreatePost(prev => !prev);
  };

  const handleNavigation = (seite) => {
    setAktiveSeite(seite);
  };

  const handleProfilePictureUploadSuccess = (url) => {
    setProfilePictureUrl(url);
    localStorage.setItem('profilePictureUrl', url);
  };

  return (
    <Router>
      <div>
        <Header
          onPlusClick={toggleCreatePost}
          isAuthenticated={isAuthenticated}
          username={username}
          setIsAuthenticated={setIsAuthenticated}
          setUsername={setUsername}
          profilePictureUrl={profilePictureUrl}
          onNavigation={handleNavigation} // Prop für Navigation
          aktiveSeite={aktiveSeite}     // Prop für aktive Seite
        />
      
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUsername={setUsername} />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/posts/erstellen"
              element={isAuthenticated ? <CreatePost /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={isAuthenticated ? <Profile onUploadSuccess={handleProfilePictureUploadSuccess} /> : <Navigate to="/login" />}
            />
            <Route
              path="/"
              element={
                <Main
                  showCreatePost={showCreatePost}
                  setShowCreatePost={setShowCreatePost} 
                  onCloseCreatePost={() => setShowCreatePost(false)}
                  aktiveSeite={aktiveSeite} // Falls Main dies benötigt
                />
              }
            />
            <Route
              path="*"
              element={<div>Seite nicht gefunden</div>}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
