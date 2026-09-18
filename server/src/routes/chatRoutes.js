const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authenticateToken = require('../middleware/auth');

router.get('/conversations', authenticateToken, chatController.getConversations);
router.get('/direct/:partnerId', authenticateToken, chatController.getDirectMessages);
router.get('/project/:projectId', authenticateToken, chatController.getProjectMessages);

module.exports = router;
