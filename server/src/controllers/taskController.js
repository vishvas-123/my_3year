const prisma = require('../config/prisma');

/**
 * Get all tasks for a project
 */
async function getTasks(req, res, next) {
  try {
    const { projectId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignedTo: {
          select: { id: true, name: true, avatar: true }
        },
        createdBy: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new task in a project
 */
async function createTask(req, res, next) {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const { title, description, priority = 'MEDIUM', assignedToId, dueDate } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const isMember = project.members.some(m => m.userId === userId && m.status === 'ACCEPTED');
    if (!isMember && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only project members can create tasks.' });
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority.toUpperCase(),
        status: 'TODO',
        assignedToId: assignedToId || null,
        createdById: userId,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, avatar: true }
        },
        createdBy: {
          select: { id: true, name: true }
        }
      }
    });

    // Notify assigned student if someone else
    if (assignedToId && assignedToId !== userId) {
      await prisma.notification.create({
        data: {
          userId: assignedToId,
          type: 'TASK',
          title: 'New Task Assigned 📋',
          message: `${req.user.name} assigned you the task "${task.title}" in "${project.title}".`,
          link: `/projects/${projectId}`
        }
      });
    }

    res.status(201).json({ success: true, message: 'Task created successfully!', task });
  } catch (err) {
    next(err);
  }
}

/**
 * Update task (status, priority, assignment, content)
 */
async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, status, priority, assignedToId, dueDate } = req.body;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: { members: true }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const isMember = task.project.members.some(m => m.userId === userId && m.status === 'ACCEPTED');
    if (!isMember && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only project members can modify tasks.' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status && { status: status.toUpperCase() }),
        ...(priority && { priority: priority.toUpperCase() }),
        ...(assignedToId !== undefined && { assignedToId: assignedToId || null }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null })
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, avatar: true }
        },
        createdBy: {
          select: { id: true, name: true }
        }
      }
    });

    // Notify newly assigned user
    if (assignedToId && assignedToId !== task.assignedToId && assignedToId !== userId) {
      await prisma.notification.create({
        data: {
          userId: assignedToId,
          type: 'TASK',
          title: 'Task Reassigned',
          message: `${req.user.name} assigned you "${updatedTask.title}".`,
          link: `/projects/${task.projectId}`
        }
      });
    }

    res.json({ success: true, message: 'Task updated!', task: updatedTask });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a task
 */
async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true }
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const isAuthorized = task.createdById === userId || task.project.ownerId === userId || req.user.role === 'ADMIN';
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task.' });
    }

    await prisma.task.delete({ where: { id } });

    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
