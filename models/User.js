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
    unique: true, // mamno3 ykoun fama 2 utilisateurs bnafs el login
    trim: true,
  },
  motDePasse: {
    type: String,
    required: [true, 'Le mot de passe est requis.'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caracteres.'],
    select: false, // bech el password matergla3ch automatiquement fi kol query
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

// Hedha el "hook" ykhdem automatiquement 9bal ma l'utilisateur yet-save
// fel database. Dorou: ychiffri (hash) el mot de passe bech ma yet5azench
// clair fel DB.
userSchema.pre('save', async function (next) {
  // Ken el mot de passe mat bdelch (mathel update fi "nom" biss),
  // manehtajouch nhashiwih mel jdid
  if (!this.isModified('motDePasse')) return next();

  const salt = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
  next();
});

// Fonction bech ne9arnou el mot de passe li dkhel bih l'utilisateur (fi
// login) m3a el mot de passe el mhacheh li mojoud fel database.
userSchema.methods.comparePassword = async function (motDePasseSaisi) {
  return bcrypt.compare(motDePasseSaisi, this.motDePasse);
};

module.exports = mongoose.model('User', userSchema);
