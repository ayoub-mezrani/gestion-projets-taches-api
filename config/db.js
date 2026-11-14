// config/db.js
// ----------------------------------------------------
// Hedha el fichier fih kol haja behi connexion m3a MongoDB.
// Ki el application tbda, el fonction connectDB() techekki fel server.js
// bech tsir el connexion, w ken fama probleme (mathel MongoDB mahouch
// cheghela) l'erreur yetle3 w el application matbdach.
// ----------------------------------------------------

const mongoose = require('mongoose');

const connectDB = async () => {
  // serverSelectionTimeoutMS: ken MongoDB mahouch disponible, matestanach
  // barsha wa9t (8 secondes w yetle3 erreur, mch tema tsir blocage)
  const connection = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 8000,
  });

  console.log(`MongoDB connecte bel success -> host: ${connection.connection.host}`);
  return connection;
};

module.exports = connectDB;
