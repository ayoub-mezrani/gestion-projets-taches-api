// controllers/taskController.js 
// ----------------------------------------------------
// CRUD mta3 el taches + tri/recherche + assignation.
// 9awa3id mouhima (mel enonce) :
//  - N'importe quel utilisateur connecte ynajem yicree tache (fi ay
//    projet mawjoud)
//  - Statut lazem ykoun  : todo / doing / done
//  - BICH el manager ynajem ya3mel "assign" (ya3ti tache l utilisateur
//    mo3ayen )
// ----------------------------------------------------

const Task = require('../models/Task');
const Project = require('../models/Project');

// Fonction mosa3da : hal l'utilisateur ynajem ychouf/ybaddel hedhi
// el tache ? (manager ychouf kol haja / proprietaire el projet ychouf
// taches mta3 projtou / l'utilisateur assigne ychouf taches li howa
// m3alem biha)
const peutVoirOuModifierTache = (task, user) => {
  if (user.role === 'manager') return true;
  if (String(task.projet.proprietaire) === String(user._id)) return true;
  if (task.utilisateurAssigne && String(task.utilisateurAssigne) === String(user._id)) return true;
  return false;
};

// Pour la suppression, nchedou el controle aktar : biss proprietaire el
// projet wala manager (mch l'utilisateur assigne biss, bech ma yfsedch
// tache mta3 haj okhor)
const peutSupprimerTache = (task, user) => {
  if (user.role === 'manager') return true;
  return String(task.projet.proprietaire) === String(user._id);
};

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { titre, description, statut, deadline, projet } = req.body;

    if (!titre || !projet) {
      return res.status(400).json({ success: false, message: 'titre et projet sont obligatoires.' });
    }

    const projetExiste = await Project.findById(projet);
    if (!projetExiste) {
      return res.status(404).json({ success: false, message: 'Le projet associe est introuvable.' });
    }

    // Remarque : ma n9ebelouch "utilisateurAssigne" hna fel creation,
    // 7it l'assignation 3andha route a part (PUT /api/tasks/:id/assign)
    // eli el manager biss ynajem yesta3mliha.
    const task = await Task.create({ titre, description, statut, deadline, projet });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks?search=...&statut=...&projet=...&sortBy=...&order=asc|desc
const getTasks = async (req, res, next) => {
  try {
    const { search, statut, projet, sortBy = 'dateCreation', order = 'desc' } = req.query;

    const conditions = [];
    if (statut) conditions.push({ statut });
    if (projet) conditions.push({ projet });
    if (search) {
      conditions.push({
        $or: [
          { titre: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      });
    }

    // Ken l'utilisateur mahouch manager : ychouf biss taches mta3
    // projet(s) mta3ou WALA taches li howa assigne biha (mch taches mel
    // ness el okhrin kolha)
    if (req.user.role !== 'manager') {
      const mesProjets = await Project.find({ proprietaire: req.user._id }).select('_id');
      const idsMesProjets = mesProjets.map((p) => p._id);

      conditions.push({
        $or: [{ projet: { $in: idsMesProjets } }, { utilisateurAssigne: req.user._id }],
      });
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};
    const sortOrder = order === 'asc' ? 1 : -1;

    const tasks = await Task.find(filter)
      .sort({ [sortBy]: sortOrder })
      .populate('projet', 'nom proprietaire')
      .populate('utilisateurAssigne', 'nom login');

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('projet', 'nom proprietaire')
      .populate('utilisateurAssigne', 'nom login');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Tache introuvable.' });
    }

    if (!peutVoirOuModifierTache(task, req.user)) {
      return res.status(403).json({ success: false, message: 'Acces interdit a cette tache.' });
    }

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('projet', 'proprietaire');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Tache introuvable.' });
    }

    if (!peutVoirOuModifierTache(task, req.user)) {
      return res.status(403).json({ success: false, message: 'Acces interdit a cette tache.' });
    }

    // Haja muhima barcha : "utilisateurAssigne" ma yet9bel ghir mel
    // manager, hata fi update 3adi (bech ma yfottelkom 7ad el 9a3ida
    // mel route /assign)
    if (req.body.utilisateurAssigne !== undefined) {
      if (req.user.role !== 'manager') {
        return res.status(403).json({
          success: false,
          message: 'Seul le manager peut assigner une tache a un utilisateur.',
        });
      }
      task.utilisateurAssigne = req.body.utilisateurAssigne;
    }

    const { titre, description, statut, deadline } = req.body;
    if (titre !== undefined) task.titre = titre;
    if (description !== undefined) task.description = description;
    if (statut !== undefined) task.statut = statut;
    if (deadline !== undefined) task.deadline = deadline;

    await task.save();
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('projet', 'proprietaire');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Tache introuvable.' });
    }

    if (!peutSupprimerTache(task, req.user)) {
      return res.status(403).json({ success: false, message: 'Acces interdit a cette tache.' });
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Tache supprimee avec succes.' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id/assign (route reservee au manager, voir routes/taskRoutes.js)
const assignTask = async (req, res, next) => {
  try {
    const { utilisateurAssigne } = req.body;
    if (!utilisateurAssigne) {
      return res.status(400).json({ success: false, message: 'utilisateurAssigne est requis.' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tache introuvable.' });
    }

    task.utilisateurAssigne = utilisateurAssigne;
    await task.save();

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask, assignTask };
