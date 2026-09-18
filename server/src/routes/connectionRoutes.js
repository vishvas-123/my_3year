const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, connectionController.getConnections);
router.post('/request', authenticateToken, connectionController.sendRequest);
router.post('/:id/respond', authenticateToken, connectionController.respondRequest);
router.delete('/:id', authenticateToken, connectionController.removeConnection);

module.exports = router;
