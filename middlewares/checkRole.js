// middlewares/checkRole.js
// ----------------------------------------------------
// Middleware "authorize": ykhdem BA3D middleware "protect" (yaani lazem
// ykoun fama req.user 9bal). Ya5ou liste mel roles eli 3andhom el ha9
// ya3mlou el action, w ken role mta3 l'utilisateur mahouch fiha ->
// erreur 403.
// Exemple isti3mal: authorize('manager') -> route behi manager biss.
// ----------------------------------------------------

const authorize = (...rolesAutorises) => {
  return (req, res, next) => {
    if (!req.user || !rolesAutorises.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Acces interdit : tu n'as pas le role necessaire pour cette action.",
      });
    }
    next();
  };
};

module.exports = authorize;
