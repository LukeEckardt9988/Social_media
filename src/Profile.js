import React, { useState, useRef } from 'react';
import './Profile.css'; // Stelle sicher, dass du eine Profile.css Datei hast

function Profile({ onUploadSuccess }) {
    const [profileImage, setProfileImage] = useState(null);
    const fileInputRef = useRef(null);
    const [uploadMessage, setUploadMessage] = useState('');
    const [uploadError, setUploadError] = useState('');

    const handleImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setProfileImage(event.target.files[0]);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!profileImage) {
            setUploadError('Bitte wähle ein Profilbild aus.');
            return;
        }

        setUploadError('');
        setUploadMessage('Profilbild wird hochgeladen...');

        const formData = new FormData();
        formData.append('profileImage', profileImage);
        const token = localStorage.getItem('accessToken');

        try {
            const response = await fetch('http://localhost:3000/upload-profile-picture', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const responseData = await response.json();
                setUploadMessage(responseData.message);
                setUploadError('');
                if (responseData.profilePictureUrl) {
                    localStorage.setItem('profilePictureUrl', responseData.profilePictureUrl); // Neues Bild speichern
                    onUploadSuccess(responseData.profilePictureUrl); // Header updaten
                }

            } else {
                const errorData = await response.json();
                setUploadError(errorData.message || 'Fehler beim Hochladen des Profilbildes.');
            }
        } catch (error) {
            setUploadError('Netzwerkfehler beim Hochladen des Profilbildes.');
        }
    };

    return (
        <div className="profile-container">
            <h2>Profilbild hochladen</h2>
            <form onSubmit={handleSubmit} className="upload-form">
                <div className="image-preview">
                    {profileImage ? (
                        <img src={URL.createObjectURL(profileImage)} alt="Profilbild Vorschau" className="preview-image" />
                    ) : (
                        <div className="placeholder-image">
                            <span>Vorschau</span>
                        </div>
                    )}
                </div>

                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} ref={fileInputRef} />
                <button type="button" onClick={handleUploadClick}>Bild auswählen</button>
                <button type="submit">Profilbild hochladen</button>
                {uploadMessage && <p className="upload-message success">{uploadMessage}</p>}
                {uploadError && <p className="upload-message error">{uploadError}</p>}
            </form>
        </div>
    );
}

export default Profile;
