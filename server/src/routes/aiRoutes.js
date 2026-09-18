const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authenticateToken = require('../middleware/auth');

router.post('/chat', authenticateToken, aiController.chat);
router.post('/roadmap', authenticateToken, aiController.generateRoadmap);
router.post('/projects', authenticateToken, aiController.suggestProjects);

module.exports = router;
