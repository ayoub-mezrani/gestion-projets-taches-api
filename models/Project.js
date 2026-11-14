// models/Project.js
// ----------------------------------------------------
// Schema mta3 el "Projet". Kol projet 3andou proprietaire (l'utilisateur
// li 3amlou), w fih statut bech na3rfou win westna fih.
// ----------------------------------------------------

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom du projet est requis.'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  proprietaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Relation m3a collection "User"
    required: true,
  },
  statut: {
    type: String,
    enum: ['en cours', 'termine', 'en pause'],
    default: 'en cours',
  },
  dateCreation: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Project', projectSchema);
