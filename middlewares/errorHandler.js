// middlewares/errorHandler.js
// ----------------------------------------------------
// 2 middlewares bech ndirou "gestion des erreurs" fi mkan wahed, mch
// nkarrarou nafs el code fi kol controller:
//  - notFound: ki el route mamoujoudach asla (ex: /api/bla-bla)
//  - errorHandler: ki fama erreur fi controller wahed (JS throw wala next(err))
// ----------------------------------------------------

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvee : ${req.originalUrl}`,
  });
};

// Hedha middleware 3andou 4 parametres (err, req, res, next) -> Express
// yfahem mnin wahdou belli hedha middleware mta3 erreurs.
const errorHandler = (err, req, res, next) => {
  console.error('Erreur :', err.message);

  // Erreur ki l'ID eli ba3thou mahouch f format sahih (ID ma9soudch)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'ID invalide.' });
  }

  // Erreur ki fama champ required mafachouch, wala enum ghalet (statut ghalet)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // Erreur ki login mkarrar (unique constraint mel MongoDB)
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Cette valeur existe deja (login en double).' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur.',
  });
};

module.exports = { notFound, errorHandler };
