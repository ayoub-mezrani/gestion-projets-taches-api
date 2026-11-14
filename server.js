// server.js
// ----------------------------------------------------
// Hedha el "point d'entree" mta3 l'application kolha.
// Fih : configuration express, branchement el middlewares el generaux,
// branchement el 3 fichiers de routes (auth/projects/tasks), w el
// gestion d'erreurs.
// ----------------------------------------------------

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors()); // ysahel l'acces mel front-end (React par exemple) eli
// mch fi nafs domaine
app.use(express.json()); // bech express yefhem el JSON eli yji fel body
// mta3 requests

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev')); // ylogi kol request fi console (ysahel el debug)
}

// Route besita bech ntestiw belli l'API tekhdem
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API Gestion de Projets & Taches - ca marche' });
});

// Branchement el 3 "groupes" de routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Ken ay route okhra mamojoudach -> 404
app.use(notFound);
// Gestion centralisee mta3 kol l'erreurs
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Nbdew bel connexion m3a MongoDB, w biss ken najhet, n5alliw el
// serveur ysma3 (listen)
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Serveur lance sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Impossible de se connecter a MongoDB :', err.message);
    process.exit(1);
  });
