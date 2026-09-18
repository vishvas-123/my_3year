const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, projectController.getProjects);
router.get('/:id', authenticateToken, projectController.getProjectById);
router.post('/', authenticateToken, projectController.createProject);
router.put('/:id', authenticateToken, projectController.updateProject);
router.delete('/:id', authenticateToken, projectController.deleteProject);
router.post('/:id/invite', authenticateToken, projectController.inviteMember);
router.post('/:id/members/:memberId/respond', authenticateToken, projectController.respondInvite);

module.exports = router;
