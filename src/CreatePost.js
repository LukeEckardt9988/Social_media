import React, { useState, useRef } from "react";
import "./CreatePost.css";

function CreatePost({ onPostSuccess }) {
  const [titel, setTitel] = useState("");
  const [text, setText] = useState("");
  const [bild, setBild] = useState(null); // Bild-Datei speichern
  const fileInputRef = useRef(null); // Referenz für das versteckte Dateieingabefeld
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setBild(event.target.files[0]); // Erste Datei speichern
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click(); // Dateiauswahlfenster öffnen
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!titel || !text) {
      setUploadError("Bitte gib einen Titel und einen Text ein.");
      return;
    }

    if (!bild) {
      setUploadError("Bitte wähle ein Bild aus.");
      return;
    }

    setUploadError("");
    setUploadMessage("Beitrag wird hochgeladen...");

    const formData = new FormData();
    formData.append("titel", titel);
    formData.append("text", text);
    formData.append("bild", bild); // Name MUSS "bild" sein, wie im Backend definiert

    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch("http://localhost:3000/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setUploadMessage("Beitrag erfolgreich erstellt!");
        setTitel("");
        setText("");
        setBild(null); // Bild zurücksetzen
        onPostSuccess(); // Schließt `CreatePost`
      } else {
        const errorData = await response.json();
        setUploadError(errorData.message || "Fehler beim Erstellen des Beitrags.");
      }
    } catch (error) {
      console.error("Fehler beim Erstellen des Beitrags:", error);
      setUploadError("Netzwerkfehler beim Hochladen des Beitrags.");
    }
  };

  return (
    <div className="create-post-container">

      <form onSubmit={handleSubmit} className="upload-form">
        <h3>Neuen Beitrag erstellen</h3>
        <div className="image-preview">
          {bild ? (
            <img
              src={URL.createObjectURL(bild)}
              alt="Beitragsbild Vorschau"
              className="preview-image"
            />
          ) : (
            <div className="placeholder-image">
              <span>Vorschau</span>
            </div>
          )}
        </div>


        <div>
          <label htmlFor="titel">Titel:</label>
          <input
            type="text"
            id="titel"
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="text">Text:</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageChange}
          ref={fileInputRef}
          name="bild" // Name muss mit Multer übereinstimmen
        />

        <button type="button" onClick={handleUploadClick}>Bild auswählen</button>

        <button type="submit">Beitrag erstellen</button>

        {uploadMessage && <p className="upload-message success">{uploadMessage}</p>}
        {uploadError && <p className="upload-message error">{uploadError}</p>}
      </form>
    </div>
  );
}

export default CreatePost;
