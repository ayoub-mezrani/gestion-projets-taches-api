// utils/generateToken.js
// ----------------------------------------------------
// Fonction wahdania: ta5ou l'utilisateur w tsayelou token JWT.
// Hedha el token houwa li l'utilisateur ba3d ki ya3mel login ya5ouh,
// w lazem y7otou fi header "Authorization: Bearer <token>" fi kol
// request behi lazemha authentification.
// ----------------------------------------------------

const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, // el "payload": el ma3loumet eli n7otouhom jewwa el token
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

module.exports = generateToken;
