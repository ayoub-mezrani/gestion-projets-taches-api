// controllers/authController.js
// ----------------------------------------------------
// Fih 2 fonctions: register (ta3mel compte jdid) w login (todkhol b
// compte mawjoud). Fel 2 el halet, nraj3ou token JWT bech l'utilisateur
// yesta3mlou fi requests  e jeya.
// ----------------------------------------------------

const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { nom, login, motDePasse, role } = req.body;

    if (!nom || !login || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: 'nom, login et motDePasse sont obligatoires.',
      });
    }

    const utilisateurExiste = await User.findOne({ login });
    if (utilisateurExiste) {
      return res.status(409).json({ success: false, message: 'Ce login est deja utilise.' });
    }

    // Remarque importante (securite) : fel vraie application, jamais
    // l'utilisateur ychouf role mta3ou wahdou (sinon kol wahed ynajem
    // ywalli "manager"). Hna, bech ysahhel el test fi hedha mini-projet,
    // khallayna role optionnel fel inscription (default = 'user').
    const nouveauRole = role === 'manager' ? 'manager' : 'user';

    const user = await User.create({ nom, login, motDePasse, role: nouveauRole });
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, nom: user.nom, login: user.login, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { login: loginSaisi, motDePasse } = req.body;

    if (!loginSaisi || !motDePasse) {
      return res.status(400).json({ success: false, message: 'login et motDePasse sont obligatoires.' });
    }

    // .select('+motDePasse') lezma hna 7it el schema 3amel select:false
    // 3al mot de passe
    const user = await User.findOne({ login: loginSaisi }).select('+motDePasse');

    const motDePasseCorrect = user ? await user.comparePassword(motDePasse) : false;

    if (!user || !motDePasseCorrect) {
      // Rissala wahda biss (mch "login ghalet" wala "password ghalet" a
      // part) bech ma n3awnouch chkoun yheb ydour fel comptes mel ness
      return res.status(401).json({ success: false, message: 'Login ou mot de passe incorrect.' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: { id: user._id, nom: user.nom, login: user.login, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
