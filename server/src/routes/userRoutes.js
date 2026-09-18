const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');

// Public profile
router.get('/:id', userController.getPublicProfile);

// Skills management
router.post('/skills', authenticateToken, userController.addUserSkill);
router.delete('/skills/:id', authenticateToken, userController.removeUserSkill);

// Goals management
router.post('/goals', authenticateToken, userController.addGoal);
router.put('/goals/:id/toggle', authenticateToken, userController.toggleGoal);
router.delete('/goals/:id', authenticateToken, userController.deleteGoal);

// Portfolio projects
router.post('/portfolio', authenticateToken, userController.addPortfolioProject);
router.delete('/portfolio/:id', authenticateToken, userController.deletePortfolioProject);

module.exports = router;
