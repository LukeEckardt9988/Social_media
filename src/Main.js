import React, { useState, useEffect } from "react";
import CreatePost from "./CreatePost";
import Post from "./Post"; // Importiere die Post-Komponente

function Main({ aktiveSeite, showCreatePost, setShowCreatePost }) {
    const [posts, setPosts] = useState([]); // Standardwert: leeres Array
    const [updateTrigger, setUpdateTrigger] = useState(0);

    // 🛠️ Funktion zum Abrufen der Posts
    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem("accessToken"); // Token holen
            const response = await fetch("http://localhost:3000/posts", {
                headers: {
                    Authorization: `Bearer ${token}`, // Token mit senden!
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP-Fehler ${response.status}: ${response.statusText}`);
            }

            const data = await response.json(); // JSON parsen
            setPosts(data); // State aktualisieren
        } catch (error) {
            console.error("Fehler beim Abrufen der Posts:", error);
        }
    };

    // 🛠️ useEffect ruft `fetchPosts()` auf, wenn `aktiveSeite` sich ändert oder `posts` aktualisiert werden
    useEffect(() => {
        if (aktiveSeite === "Main") {
            fetchPosts();
        }
    }, [aktiveSeite, updateTrigger]); 

    // 🛠️ Diese Funktion wird nach dem Erstellen eines Posts aufgerufen
    const handlePostSuccess = () => {
        setShowCreatePost(false); 
        setUpdateTrigger(prev => prev + 1); 
    };

    if (aktiveSeite !== "Main") return null; // Falls die Seite nicht "Main" ist, nichts rendern

    return (
        <div className="haupt-inhalt">
            {showCreatePost && <CreatePost onPostSuccess={handlePostSuccess} />} {/* `CreatePost` erscheint nur, wenn `showCreatePost` true ist */}

            {posts.length === 0 ? (
                <p>Keine Beiträge vorhanden.</p>
            ) : (
                posts.map((post) => (
                    <Post
                        key={post.beitrag_id} // `beitrag_id` als `key` nutzen
                        titel={post.titel}
                        postId={post.beitrag_id} 
                        text={post.text}
                        bild={post.bild}
                        username={post.benutzer_name} // Benutzername aus der Backend-Antwort
                        profilePictureUrl={post.benutzer_profilbild_url} // Profilbild-URL aus der Backend-Antwort
                    />
                ))
            )}
        </div>
    );
}

export default Main;
