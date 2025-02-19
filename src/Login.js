import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Make sure this import is present!

function Login({ setIsAuthenticated, setUsername }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate(); // Make sure useNavigate is called here!

  //const [profilePictureUrl, setProfilePictureUrl] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passwort: password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('username', data.username);
        //localStorage.setItem('profilePictureUrl', profilePictureUrl); // Profilbild-URL im localStorage speichern
        setIsAuthenticated(true);
        setUsername(data.username);
        navigate('/'); // navigate is now defined because of useNavigate hook
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Login failed");
      }
    } catch (error) {
      setErrorMessage("Error during login");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {errorMessage && <div className="error">{errorMessage}</div>}
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;