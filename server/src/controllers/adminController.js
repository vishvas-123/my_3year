const prisma = require('../config/prisma');

/**
 * Get platform metrics and analytics
 */
async function getAdminStats(req, res, next) {
  try {
    const totalUsers = await prisma.user.count();
    const studentUsers = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalProjects = await prisma.project.count();
    const activeProjects = await prisma.project.count({ where: { status: 'IN_PROGRESS' } });
    const totalConnections = await prisma.connection.count();
    const acceptedConnections = await prisma.connection.count({ where: { status: 'ACCEPTED' } });
    const totalTasks = await prisma.task.count();
    const totalMessages = await prisma.message.count();
    const totalSkills = await prisma.skill.count();

    // Recent activity registrations
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, college: true, role: true, status: true, createdAt: true }
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        studentUsers,
        totalProjects,
        activeProjects,
        totalConnections,
        acceptedConnections,
        totalTasks,
        totalMessages,
        totalSkills
      },
      recentUsers
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all users with filters for admin management
 */
async function getUsers(req, res, next) {
  try {
    const { search, role, status } = req.query;

    let whereClause = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { college: { contains: search } }
      ];
    }

    if (role) {
      whereClause.role = role.toUpperCase();
    }

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        college: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            skills: true,
            ownedProjects: true,
            sentConnections: true,
            receivedConnections: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
}

/**
 * Update user status (ACTIVE / SUSPENDED)
 */
async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ACTIVE' or 'SUSPENDED'

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be ACTIVE or SUSPENDED.' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (targetUser.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot suspend your own admin account.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status }
    });

    res.json({
      success: true,
      message: `User account status updated to ${status}.`,
      user: { id: updated.id, status: updated.status }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update user role (STUDENT / ADMIN)
 */
async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['STUDENT', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    if (id === req.user.id && role !== 'ADMIN') {
      return res.status(400).json({ success: false, message: 'Cannot demote your own admin account.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role }
    });

    res.json({ success: true, message: `User role updated to ${role}.`, user: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all projects for moderation
 */
async function getProjects(req, res, next) {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true, college: true } },
        _count: { select: { members: true, tasks: true, messages: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, projects });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete project (Admin moderation action)
 */
async function adminDeleteProject(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.project.delete({ where: { id } });

    res.json({ success: true, message: 'Project removed by administrator.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAdminStats,
  getUsers,
  updateUserStatus,
  updateUserRole,
  getProjects,
  adminDeleteProject
};
