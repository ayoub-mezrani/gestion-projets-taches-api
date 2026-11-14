// models/User.js
// ----------------------------------------------------
// Schema/model mta3 l'utilisateur.
// Fama 2 types d'utilisateurs: "user" (3adi) w "manager" (3andou
// privileges akther: ychouf koll el projets w ya3mel assign l task
// l utilisateur mo3ayen).
// ----------------------------------------------------

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis.'],
    trim: true,
  },
  login: {
    type: String,
    required: [true, 'Le login est requis.'],
    unique: true,
    trim: true,
  },
  motDePasse: {
    type: String,
    required: [true, 'Le mot de passe est requis.'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caracteres.'],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'manager'],
    default: 'user',
  },
  dateCreation: {
    type: Date,
    default: Date.now,
  },
});

// IMPORTANT : pas de parametre "next" ici. Avec async/await, Mongoose
// detecte automatiquement la fin du hook quand la fonction se termine
// (ou leve une erreur si ca plante). Melanger async/await ET next()
// cause le bug "next is not a function".
userSchema.pre('save', async function () {
  if (!this.isModified('motDePasse')) return;

  const salt = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
});

userSchema.methods.comparePassword = async function (motDePasseSaisi) {
  return bcrypt.compare(motDePasseSaisi, this.motDePasse);
};

module.exports = mongoose.model('User', userSchema);