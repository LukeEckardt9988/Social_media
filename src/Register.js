import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");

        try {
            const response = await fetch("http://localhost:3000/register", { // Backend-Endpunkt bleibt "/register" (Deutsch)
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, passwort: password }), // "passwort" im Body bleibt Deutsch, da Backend Deutsch erwartet
            });

            if (response.ok) {
                // Registration successful
                navigate('/login'); // Redirect to Login page after registration
                setName("");
                setEmail("");
                setPassword("");
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message || "Registration failed");
            }
        } catch (error) {
            setErrorMessage("Error during registration");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
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
                    autoComplete="current-password"
                />
            </div>
            {errorMessage && <div className="error">{errorMessage}</div>}
            <button type="submit">Register</button>
        </form>
    );
}

export default Register;