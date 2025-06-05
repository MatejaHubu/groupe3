const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors({
  origin: '*', // Autorise toutes les origines (déconseillé en prod)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json()); // Pour parser le JSON

// Connexion MySQL (pool recommandé)
// Configuration de la connexion
const db = mysql.createPool({
  connectionLimit: 10,
  host: '152.228.134.45',
  user: 'clement',
  password: 'P@ssw0rd!',
  database: 'groupe3'
});

// ✅ Test de l'API
app.get('/', (req, res) => {
  res.send('API de gestion de tâches OK');
});

app.listen(port, () => {
  console.log(`Serveur Node.js lancé sur http://localhost:${port}`);
});


// Lire les taches
app.get('/api/taches', (req, res) => {
  db.query('SELECT * FROM tache', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Ajouter une tache
app.post('/api/taches', (req, res) => {
  const { id, titre, description, charge, statut } = req.body;
  const sql = 'INSERT INTO tache (id, titre, description, charge, statut) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [id, titre, description, charge, statut], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: 'Tâche ajoutée' });
  });
});

// Modifier une tache
app.put('/api/taches/:id', (req, res) => {
  const { titre, description, charge, statut } = req.body;
  const sql = 'UPDATE tache SET titre = ?, description = ?, charge = ?, statut = ? WHERE id = ?';
  db.query(sql, [titre, description, charge, statut, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Tâche mise à jour' });
  });
});

// Supprimer une tache
app.delete('/api/taches/:id', (req, res) => {
  db.query('DELETE FROM tache WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Tâche supprimée' });
  });
});
