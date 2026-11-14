// controllers/projectController.js
// ----------------------------------------------------
// CRUD mta3 el projets + tri/recherche.
// 9a3ida el muhima : "manager" ychouf KOL el projets, "user" 3adi
// ychouf BISS el projets mta3ou (li howa el proprietaire mta3hom).
// ----------------------------------------------------

const Project = require('../models/Project');

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { nom, description, statut } = req.body;

    if (!nom) {
      return res.status(400).json({ success: false, message: 'Le nom du projet est requis.' });
    }

    // N'importe quel utilisateur connecte ynajem ya3mel projet (c'est la
    // regle de l'enonce)
    const project = await Project.create({
      nom,
      description,
      statut,
      proprietaire: req.user._id,
    });

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects?search=...&statut=...&sortBy=...&order=asc|desc
const getProjects = async (req, res, next) => {
  try {
    const { search, statut, sortBy = 'dateCreation', order = 'desc' } = req.query;

    const filter = {};

    // Hedhi el ligne tetbe3 el 9a3ida : manager ychouf kol haja, user
    // ychouf mta3ou biss
    if (req.user.role !== 'manager') {
      filter.proprietaire = req.user._id;
    }

    if (statut) filter.statut = statut;

    if (search) {
      // $or : nfattchou el mot-cle fi "nom" WALA fi "description"
      // (case-insensitive bel $options:'i')
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;

    const projects = await Project.find(filter)
      .sort({ [sortBy]: sortOrder })
      .populate('proprietaire', 'nom login');

    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('proprietaire', 'nom login');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Projet introuvable.' });
    }

    const estProprietaire = String(project.proprietaire._id) === String(req.user._id);
    if (req.user.role !== 'manager' && !estProprietaire) {
      return res.status(403).json({ success: false, message: 'Acces interdit a ce projet.' });
    }

    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Projet introuvable.' });
    }

    const estProprietaire = String(project.proprietaire) === String(req.user._id);
    if (req.user.role !== 'manager' && !estProprietaire) {
      return res.status(403).json({ success: false, message: 'Acces interdit a ce projet.' });
    }

    const { nom, description, statut } = req.body;
    if (nom !== undefined) project.nom = nom;
    if (description !== undefined) project.description = description;
    if (statut !== undefined) project.statut = statut;

    await project.save();
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Projet introuvable.' });
    }

    const estProprietaire = String(project.proprietaire) === String(req.user._id);
    if (req.user.role !== 'manager' && !estProprietaire) {
      return res.status(403).json({ success: false, message: 'Acces interdit a ce projet.' });
    }

    await project.deleteOne();
    res.json({ success: true, message: 'Projet supprime avec succes.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject };
