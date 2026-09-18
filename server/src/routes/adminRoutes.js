const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');

// All admin routes require token authentication + ADMIN role
router.use(authenticateToken, requireAdmin);

router.get('/stats', adminController.getAdminStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/role', adminController.updateUserRole);
router.get('/projects', adminController.getProjects);
router.delete('/projects/:id', adminController.adminDeleteProject);

module.exports = router;
