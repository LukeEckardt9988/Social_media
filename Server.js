import express, { json } from 'express';
import cors from 'cors';
import { createConnection } from 'mysql2/promise';
import jwt from 'jsonwebtoken';
const { verify, sign } = jwt;
import { hash, compare } from 'bcrypt';
import multer from 'multer'; // Multer importieren
import path from 'path';     // Path Modul importieren
import { fileURLToPath } from 'url'; // fileURLToPath importieren


const app = express();

// Verwende die cors-Middleware
app.use(cors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

app.use(express.json());

// Datenbankverbindung
const db = await createConnection({
    host: 'localhost',
    user: 'root',
    database: 'firmen_social_media'
});

// Teste die Verbindung
try {
    await db.execute('SELECT 1');
    console.log('Datenbankverbindung erfolgreich!');
} catch (error) {
    console.error('Fehler bei der Datenbankverbindung:', error);
}

// API-Endpunkt zum Abrufen von Beiträgen
// API-Endpunkt zum Abrufen von Beiträgen (aktualisiert mit JOIN für Benutzerdaten)
app.get('/posts', authenticateToken, async (req, res) => {
    try {
        // Angepasste SQL-Abfrage mit JOIN, um Benutzerdaten zu holen
        const [rows] = await db.execute(`
            SELECT
                b.id AS beitrag_id,  -- Alias für Beitrags-ID
                b.benutzer_id,
                b.titel,
                b.text,
                b.bild,
                b.erstellt_am,
                ben.name AS benutzer_name, -- Benutzername
                ben.profile_picture_url AS benutzer_profilbild_url -- Profilbild-URL
            FROM
                beitraege b
            JOIN
                benutzer ben ON b.benutzer_id = ben.id
            ORDER BY
                b.erstellt_am DESC
        `);

        const posts = rows.map(beitrag => ({
            ...beitrag,
            bild: beitrag.bild ? `http://localhost:3000${beitrag.bild}` : null
        }));

        res.json(posts);
    } catch (error) {
        console.error("Fehler beim Abrufen der Beiträge mit Benutzerdaten:", error); // Logge Fehler detaillierter
        res.status(500).json({ message: 'Fehler beim Abrufen der Beiträge' });
    }
});



const storagePosts = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads/beitragsbilder/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadPosts = multer({
    storage: storagePosts,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5 MB Limit 
    }
});




// API-Endpunkt zum Erstellen eines Beitrags (mit Authentifizierung)
app.post('/posts', authenticateToken, uploadPosts.single('bild'), async (req, res) => {
    try {
        const { titel, text } = req.body;
        const bildPfad = '/uploads/beitragsbilder/' + req.file.filename; // Bildpfad aus req.file.filename

        const result = await db.execute(
            'INSERT INTO beitraege (benutzer_id, titel, text, bild) VALUES (?,?,?,?)',
            [req.user.id, titel, text, bildPfad] // Bildpfad in Datenbank speichern
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Fehler beim Erstellen des Beitrags' });
    }
});




// Authentifizierungs-Middleware (unverändert)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    verify(token, 'dein_geheimer_schluessel', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Registrieren (unverändert)
app.post('/register', async (req, res) => {
    console.log("### /register Route wurde erreicht! ###");
    console.log("Registrierungsanfrage empfangen");

    try {
        const { name, email, passwort } = req.body;
        const hashedPassword = await hash(passwort, 10);
        const result = await db.execute(
            'INSERT INTO benutzer (name, email, passwort) VALUES (?,?,?)',
            [name, email, hashedPassword]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Fehler bei der Registrierung' });
    }
});

// Anmelden (unverändert)
app.post('/login', async (req, res) => {
    try {
        const { email, passwort } = req.body;
        const [rows] = await db.execute('SELECT * FROM benutzer WHERE email =?', [email]);
        const user = rows[0];
        if (user && await compare(passwort, user.passwort)) {
            const accessToken = sign({ id: user.id, name: user.name }, 'dein_geheimer_schluessel'); // Benutzername zum Payload hinzufügen
            res.json({ accessToken, username: user.name }); // Benutzernamen im Response senden!
        } else {
            res.status(401).json({ message: 'Ungültige Anmeldedaten' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Fehler bei der Anmeldung' });
    }
});

// **Konfiguration für Multer zum Speichern der Profilbilder (aktualisiert für __dirname)**
const __filename = fileURLToPath(import.meta.url); // __filename in ES-Modulen definieren
const __dirname = path.dirname(__filename);       // __dirname in ES-Modulen definieren

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads/profile-pictures/')); // Speicherort für Profilbilder (jetzt mit __dirname)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5 MB Limit 
    }
});

// **Profilbild-Upload Endpunkt**
app.post('/upload-profile-picture', authenticateToken, upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Keine Datei hochgeladen' });
        }

        const userId = req.user.id;
        const profilePictureUrl = '/uploads/profile-pictures/' + req.file.filename; // URL zum gespeicherten Bild erstellen

        // Pfad zur Profilbild-URL in der Datenbank des Benutzers speichern
        await db.execute(
            'UPDATE benutzer SET profile_picture_url = ? WHERE id = ?',
            [profilePictureUrl, userId]
        );

        res.json({ message: 'Profilbild erfolgreich hochgeladen', profilePictureUrl: profilePictureUrl });

    } catch (error) {
        console.error(err);
        console.error("Fehler beim Hochladen des Profilbildes:", error);
        res.status(500).json({ message: 'Fehler beim Hochladen des Profilbildes' });
    }
});

// **Statische Dateien für Profilbilder bereitstellen**
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.listen(3000, () => {
    console.log('Server listening on port 3000');
});










// --- LIKES ---

// API-Endpunkt: Beitrag liken
app.post('/posts/:postId/like', authenticateToken, async (req, res) => {
    const postId = req.params.postId;
    const benutzerId = req.user.id; // Benutzer-ID aus dem authentifizierten Token

    try {
        // Prüfen, ob der Benutzer den Beitrag bereits geliked hat
        const [existingLike] = await db.execute(
            'SELECT * FROM likes WHERE beitrag_id = ? AND benutzer_id = ?',
            [postId, benutzerId]
        );

        if (existingLike.length > 0) {
            return res.status(400).json({ message: 'Beitrag bereits geliked' }); // Oder 200 OK mit Meldung "bereits geliked", je nach gewünschtem Verhalten
        }

        await db.execute(
            'INSERT INTO likes (beitrag_id, benutzer_id) VALUES (?, ?)',
            [postId, benutzerId]
        );

        res.status(201).json({ message: 'Beitrag geliked' });

    } catch (error) {
        console.error("Fehler beim Liken des Beitrags:", error);
        res.status(500).json({ message: 'Fehler beim Liken des Beitrags' });
    }
});

// API-Endpunkt: Like von Beitrag entfernen
app.delete('/posts/:postId/like', authenticateToken, async (req, res) => {
    const postId = req.params.postId;
    const benutzerId = req.user.id;

    try {
        await db.execute(
            'DELETE FROM likes WHERE beitrag_id = ? AND benutzer_id = ?',
            [postId, benutzerId]
        );
        res.json({ message: 'Like entfernt' });

    } catch (error) {
        console.error("Fehler beim Entfernen des Likes:", error);
        res.status(500).json({ message: 'Fehler beim Entfernen des Likes' });
    }
});

// API-Endpunkt: Anzahl der Likes für einen Beitrag abrufen
app.get('/posts/:postId/likes/count', async (req, res) => {
    const postId = req.params.postId;

    try {
        const [rows] = await db.execute(
            'SELECT COUNT(*) AS likeCount FROM likes WHERE beitrag_id = ?',
            [postId]
        );
        const likeCount = rows[0].likeCount;
        res.json({ likeCount });

    } catch (error) {
        console.error("Fehler beim Abrufen der Like-Anzahl:", error);
        res.status(500).json({ message: 'Fehler beim Abrufen der Like-Anzahl' });
    }
});


// --- KOMMENTARE ---

// API-Endpunkt: Kommentare zu einem Beitrag abrufen
app.get('/posts/:postId/comments', async (req, res) => {
    const postId = req.params.postId;

    try {
        const [rows] = await db.execute(`
            SELECT
                k.id AS kommentar_id,
                k.text AS kommentar_text,
                k.erstellt_am AS kommentar_erstellt_am,
                ben.name AS benutzer_name, -- Benutzername des Kommentierenden
                ben.profile_picture_url AS benutzer_profilbild_url -- Profilbild des Kommentierenden
            FROM
                kommentare k
            JOIN
                benutzer ben ON k.benutzer_id = ben.id
            WHERE
                k.beitrag_id = ?
            ORDER BY
                k.erstellt_am ASC -- Oder DESC, je nach gewünschter Sortierung
        `, [postId]);

        res.json(rows);

    } catch (error) {
        console.error("Fehler beim Abrufen der Kommentare:", error);
        res.status(500).json({ message: 'Fehler beim Abrufen der Kommentare' });
    }
});


// API-Endpunkt: Kommentar zu einem Beitrag hinzufügen
app.post('/posts/:postId/comments', authenticateToken, async (req, res) => {
    const postId = req.params.postId;
    const benutzerId = req.user.id;
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ message: 'Kommentartext fehlt' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO kommentare (beitrag_id, benutzer_id, text) VALUES (?, ?, ?)',
            [postId, benutzerId, text]
        );
        const kommentarId = result.insertId; // ID des neu erstellten Kommentars

        // Optional:  Direkt den neu erstellten Kommentar zurückgeben, um ihn im Frontend anzuzeigen
        const [newCommentRows] = await db.execute(`
            SELECT
                k.id AS kommentar_id,
                k.text AS kommentar_text,
                k.erstellt_am AS kommentar_erstellt_am,
                ben.name AS benutzer_name,
                ben.profile_picture_url AS benutzer_profilbild_url
            FROM
                kommentare k
            JOIN
                benutzer ben ON k.benutzer_id = ben.id
            WHERE
                k.id = ?
        `, [kommentarId]);
        const newComment = newCommentRows[0];


        res.status(201).json({ message: 'Kommentar hinzugefügt', comment: newComment }); // Optional: Sende den neuen Kommentar zurück

    } catch (error) {
        console.error("Fehler beim Hinzufügen des Kommentars:", error);
        res.status(500).json({ message: 'Fehler beim Hinzufügen des Kommentars' });
    }
});