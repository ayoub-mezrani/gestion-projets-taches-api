// routes/taskRoutes.js
// ----------------------------------------------------
// Kifkif el projets : kol routes protegees (protect). Zedna row wahda
// behi el manager biss (/assign) bel middleware authorize('manager').
// ----------------------------------------------------

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const authorize = require('../middlewares/checkRole');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
} = require('../controllers/taskController');

router.use(protect);

router.route('/').post(createTask).get(getTasks);

router.route('/:id').get(getTaskById).put(updateTask).delete(deleteTask);

// Hedhi el route behi manager biss : ya3ti tache l utilisateur
router.put('/:id/assign', authorize('manager'), assignTask);

module.exports = router;
