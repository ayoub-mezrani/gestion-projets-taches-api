// routes/projectRoutes.js
// ----------------------------------------------------
// Kol el routes hedhom "protegees" (router.use(protect) fel bidaya) :
// yaani lazem tkoun connecte (token sahih) bech tosel l ay route mel
// hedhom.
// ----------------------------------------------------

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

router.use(protect);

router.route('/').post(createProject).get(getProjects);

router.route('/:id').get(getProjectById).put(updateProject).delete(deleteProject);

module.exports = router;
