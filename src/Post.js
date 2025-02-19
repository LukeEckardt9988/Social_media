import React, { useState, useEffect, useRef } from 'react';
import './Post.css'; // Stelle sicher, dass Post.css importiert ist

function Post({ postId, titel, text, bild, kannBearbeiten, onBearbeiten, onLöschen, username, profilePictureUrl }) { // postId als prop hinzugefügt
  const [likeCount, setLikeCount] = useState(0);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const commentSectionRef = useRef(null); // Referenz für den Kommentarbereich

  const token = localStorage.getItem("accessToken");
  const loggedInUsername = localStorage.getItem("username"); // Optional, falls du den Benutzernamen des aktuellen Users brauchst

  useEffect(() => {
    const fetchData = async () => {
      await fetchLikeCount();
      await fetchComments();
      await checkIfLikedByUser(); // Optional: Überprüfen, ob der aktuelle Benutzer geliked hat
    };
    fetchData();
  }, [postId, loggedInUsername]); // Abhängigkeiten: postId und loggedInUsername, falls relevant

  const fetchLikeCount = async () => {
    try {
      const response = await fetch(`http://localhost:3000/posts/${postId}/likes/count`);
      if (response.ok) {
        const data = await response.json();
        setLikeCount(data.likeCount);
      } else {
        console.error("Fehler beim Abrufen der Like-Anzahl");
      }
    } catch (error) {
      console.error("Netzwerkfehler beim Abrufen der Like-Anzahl:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:3000/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        console.error("Fehler beim Abrufen der Kommentare");
      }
    } catch (error) {
      console.error("Netzwerkfehler beim Abrufen der Kommentare:", error);
    }
  };


  const checkIfLikedByUser = async () => {
    // *** Backend-Endpunkt zum Prüfen, ob Benutzer geliked hat, ist noch NICHT implementiert im Backend-Code! ***
    // *** Du müsstest einen solchen Endpunkt im Backend hinzufügen, falls du diese Funktionalität brauchst ***
    // *** Aktuell wird diese Funktion NICHT aufgerufen, da sie noch nicht implementiert ist ***
    // *** Beispiel-Implementierung im Frontend (funktioniert nur, wenn Backend-Endpunkt implementiert ist) ***

    /*
    if (!token) {
        setIsLikedByUser(false); // Nicht geliked, wenn nicht angemeldet
        return;
    }
    try {
        const response = await fetch(`http://localhost:3000/posts/${postId}/liked-by-user`, { // *** Backend-Endpunkt anpassen! ***
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (response.ok) {
            const data = await response.json();
            setIsLikedByUser(data.isLiked); // Backend sollte { isLiked: true/false } zurückgeben
        } else if (response.status === 404) {
            setIsLikedByUser(false); // Nicht geliked, wenn 404 (nicht gefunden)
        } else {
            console.error("Fehler beim Prüfen, ob Beitrag geliked wurde");
            setIsLikedByUser(false); // Im Fehlerfall sicherheitshalber als "nicht geliked" annehmen
        }
    } catch (error) {
        console.error("Netzwerkfehler beim Prüfen, ob Beitrag geliked wurde:", error);
        setIsLikedByUser(false); // Im Fehlerfall sicherheitshalber als "nicht geliked" annehmen
    }
    */
  };


  const handleLikeClick = async () => {
    if (!token) {
      alert("Bitte melde dich an, um Beiträge zu liken."); // Oder zeige eine schönere Benachrichtigung an
      return;
    }

    const method = isLikedByUser ? 'DELETE' : 'POST'; // DELETE für Unlike, POST für Like

    try {
      const response = await fetch(`http://localhost:3000/posts/${postId}/like`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsLikedByUser(!isLikedByUser); // Zustand im Frontend sofort umschalten
        fetchLikeCount(); // Like-Anzahl neu vom Server holen, um sicherzustellen, dass sie aktuell ist
      } else {
        console.error(`Fehler beim Ändern des Likes (Status: ${response.status})`);
        // Optional: Fehler im UI anzeigen
      }
    } catch (error) {
      console.error("Netzwerkfehler beim Ändern des Likes:", error);
      // Optional: Fehler im UI anzeigen
    }
  };


  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      alert("Bitte melde dich an, um Kommentare zu schreiben."); // Oder schönere Benachrichtigung
      return;
    }

    if (!commentInput.trim()) {
      alert("Bitte gib einen Kommentartext ein."); // Oder schönere Validierung/Benachrichtigung
      return;
    }


    try {
      const response = await fetch(`http://localhost:3000/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: commentInput }),
      });

      if (response.ok) {
        // Kommentar erfolgreich gepostet
        setCommentInput(''); // Eingabefeld leeren
        await fetchComments(); // Kommentare neu laden, um den neuen Kommentar anzuzeigen
        if (commentSectionRef.current) {
          commentSectionRef.current.scrollTop = commentSectionRef.current.scrollHeight; // Kommentarbereich nach unten scrollen
        }


      } else {
        console.error("Fehler beim Posten des Kommentars");
        // Optional: Fehler im UI anzeigen
      }
    } catch (error) {
      console.error("Netzwerkfehler beim Posten des Kommentars:", error);
      // Optional: Fehler im UI anzeigen
    }
  };


  return (
    <div className="post-container">
      <div className="post-header">
        <img
          src={profilePictureUrl ? `http://localhost:3000${profilePictureUrl}` : "/images/profilimg.png"}
          alt={`${username} Profilbild`}
          className="profile-picture-small"
        />
        <span className="username">{username}</span>
      </div>
      <div className="beitrag">
        <h3 className="titel">{titel}</h3>
        {bild ? (
          <img className="postImg" src={bild.startsWith('data') ? bild : `${bild}`} alt={titel} />
        ) : (
          <p>Kein Bild verfügbar</p>
        )}

      </div>
      <p className="post-text">{text}</p>

      <div className="post-actions">
        <button className={`like-button ${isLikedByUser ? 'liked' : ''}`} onClick={handleLikeClick}>
          {isLikedByUser ? '❤️' : '🤍'} {/* Oder Daumen hoch Icon/Emoji */}
        </button>
        <span className="like-count">{likeCount} Likes</span>
      </div>

      <div className="comment-section" ref={commentSectionRef}>
        <h4>Kommentare</h4>
        <ul className="comments-list">
          {comments.map(comment => (
            <li key={comment.kommentar_id} className="comment">
              <div className="comment-header">
                <img
                  src={comment.benutzer_profilbild_url ? `http://localhost:3000${comment.benutzer_profilbild_url}` : "/images/profilimg.png"}
                  alt={`${comment.benutzer_name} Profilbild`}
                  className="comment-profile-picture-small"
                />
                <div className="nameDate"> 
                  <span className="comment-username">{comment.benutzer_name}</span>
                  <p className="comment-date">{new Date(comment.kommentar_erstellt_am).toLocaleString()}</p>
                </div>
              </div>
              <div className="comment-text">{comment.kommentar_text}</div> 
            </li>
          ))}
        </ul>

        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            id="commentInput"
            className="comment-input"
            placeholder="Schreibe einen Kommentar..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
          />
          <button type="submit" className="comment-submit-button">Kommentieren</button>
        </form>
      </div>


      {kannBearbeiten && (
        <div>
          <button onClick={onBearbeiten}>Bearbeiten</button>
          <button onClick={onLöschen}>Löschen</button>
        </div>
      )}
      {/*... (Kommentare und Likes)... */}
    </div>
  );
}

export default Post;