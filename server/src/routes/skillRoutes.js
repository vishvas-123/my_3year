const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const authenticateToken = require('../middleware/auth');

router.get('/', skillController.getAllSkills);
router.get('/search', skillController.searchSkills);
router.get('/matches', authenticateToken, skillController.getMatches);
router.get('/dashboard-recommendations', authenticateToken, skillController.getDashboardRecommendations);

module.exports = router;
