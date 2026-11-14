// middlewares/auth.js
// ----------------------------------------------------
// Middleware "protect": hedha el garde li yechcheck belli l'utilisateur
// 3andou token JWT sahih 9bal ma ykhalih yosel l routes el protegees.
// Ken token sahih -> n7otou l'utilisateur fi req.user bech el controllers
// kol ynajmou ya3rfouh, w nkomplou l'execution (next()).
// Ken token ghalet/mafamech -> nraj3ou erreur 401 (non autorise).
// ----------------------------------------------------

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    // Format mountadhar: "Authorization: Bearer eyJhbGciOi..."
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acces refuse : aucun token fourni.',
      });
    }

    // nverifiw el token bel secret mta3na (ken expire wala falsifie -> throw)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // njibou l'utilisateur mel DB (mch nou9fou biss 3al info mta3 el
    // token, bech ken l'utilisateur et-suppressa mel DB, el request
    // matkomplich)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur introuvable, token invalide.',
      });
    }

    req.user = user; // hedhi el ligne el muhima: kol controller jay ba3d
    // hedha ynajem ya3mel req.user
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expire.',
    });
  }
};

module.exports = { protect };
