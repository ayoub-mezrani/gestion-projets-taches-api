// models/Task.js
// ----------------------------------------------------
// Schema mta3 el "Tache". Kol tache marbouta b "projet" wahed
// (obligatoire), w tnajem tkoun "assignee" l utilisateur mo3ayen
// (manager biss howa li ynajem ya3mel hedhi l'affectation).
// ----------------------------------------------------

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre de la tache est requis.'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  statut: {
    type: String,
    enum: ['todo', 'doing', 'done'], // Lazem ykoun biss wahda mel 3 haja
    default: 'todo',
  },
  deadline: {
    type: Date,
  },
  projet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'La tache doit etre associee a un projet.'],
  },
  utilisateurAssigne: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Fel bidaya, el tache tnajem matkounch assignee l7ad
  },
  dateCreation: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Task', taskSchema);
