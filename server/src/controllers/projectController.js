const prisma = require('../config/prisma');

/**
 * Get projects (all public or user's active projects)
 */
async function getProjects(req, res, next) {
  try {
    const { filter, search } = req.query;
    const userId = req.user.id;

    let whereClause = {};

    if (filter === 'my-projects') {
      whereClause = {
        members: {
          some: {
            userId,
            status: 'ACCEPTED'
          }
        }
      };
    } else if (filter === 'owned') {
      whereClause = { ownerId: userId };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { techStack: { contains: search } }
      ];
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        owner: {
          select: { id: true, name: true, avatar: true, college: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, college: true }
            }
          }
        },
        tasks: {
          select: { id: true, status: true }
        },
        _count: {
          select: { tasks: true, members: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Compute progress % for each project
    const projectsWithProgress = projects.map(p => {
      const totalTasks = p.tasks.length;
      const doneTasks = p.tasks.filter(t => t.status === 'DONE').length;
      const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
      return {
        ...p,
        progress,
        doneTasksCount: doneTasks,
        totalTasksCount: totalTasks
      };
    });

    res.json({ success: true, projects: projectsWithProgress });
  } catch (err) {
    next(err);
  }
}

/**
 * Get project details by ID
 */
async function getProjectById(req, res, next) {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true, college: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, college: true, email: true }
            }
          }
        },
        tasks: {
          include: {
            assignedTo: {
              select: { id: true, name: true, avatar: true }
            },
            createdBy: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const totalTasks = project.tasks.length;
    const doneTasks = project.tasks.filter(t => t.status === 'DONE').length;
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    res.json({
      success: true,
      project: {
        ...project,
        progress,
        doneTasksCount: doneTasks,
        totalTasksCount: totalTasks
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new collaborative project
 */
async function createProject(req, res, next) {
  try {
    const userId = req.user.id;
    const { title, description, techStack, githubUrl, liveUrl, invitedUserIds = [] } = req.body;

    if (!title?.trim() || !description?.trim() || !techStack?.trim()) {
      return res.status(400).json({ success: false, message: 'Title, description, and tech stack are required.' });
    }

    // Create project and assign creator as OWNER member
    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        techStack: techStack.trim(),
        githubUrl: githubUrl?.trim() || null,
        liveUrl: liveUrl?.trim() || null,
        ownerId: userId,
        status: 'PLANNING',
        members: {
          create: [
            {
              userId,
              role: 'OWNER',
              status: 'ACCEPTED'
            },
            ...invitedUserIds.map(uid => ({
              userId: uid,
              role: 'COLLABORATOR',
              status: 'PENDING'
            }))
          ]
        }
      },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true }
        },
        members: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          }
        }
      }
    });

    // Notify invited users
    for (const uid of invitedUserIds) {
      await prisma.notification.create({
        data: {
          userId: uid,
          type: 'PROJECT',
          title: 'Project Collaboration Invitation',
          message: `${req.user.name} invited you to collaborate on "${project.title}".`,
          link: `/projects/${project.id}`
        }
      });
    }

    res.status(201).json({ success: true, message: 'Project created successfully!', project });
  } catch (err) {
    next(err);
  }
}

/**
 * Update project details
 */
async function updateProject(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, techStack, status, githubUrl, liveUrl } = req.body;

    const project = await prisma.project.findUnique({
      where: { id },
      include: { members: true }
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const isMember = project.members.some(m => m.userId === userId && m.status === 'ACCEPTED');
    const isOwner = project.ownerId === userId || req.user.role === 'ADMIN';

    if (!isMember && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this project.' });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description && { description: description.trim() }),
        ...(techStack && { techStack: techStack.trim() }),
        ...(status && { status }),
        ...(githubUrl !== undefined && { githubUrl: githubUrl?.trim() || null }),
        ...(liveUrl !== undefined && { liveUrl: liveUrl?.trim() || null })
      }
    });

    res.json({ success: true, message: 'Project updated!', project: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete project
 */
async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.ownerId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only project owner or administrator can delete.' });
    }

    await prisma.project.delete({ where: { id } });

    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * Invite student to project
 */
async function inviteMember(req, res, next) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user.id;

    const project = await prisma.project.findUnique({
      where: { id },
      include: { members: true }
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const isOwner = project.ownerId === currentUserId;
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Only project owner can invite collaborators.' });
    }

    const existingMember = project.members.find(m => m.userId === userId);
    if (existingMember) {
      return res.status(400).json({ success: false, message: 'User is already a member or pending invite.' });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId,
        role: 'COLLABORATOR',
        status: 'PENDING'
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      }
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId,
        type: 'PROJECT',
        title: 'Project Invitation',
        message: `${req.user.name} invited you to join "${project.title}".`,
        link: `/projects/${id}`
      }
    });

    res.status(201).json({ success: true, message: 'Invitation sent!', member });
  } catch (err) {
    next(err);
  }
}

/**
 * Accept or reject project invitation
 */
async function respondInvite(req, res, next) {
  try {
    const { id, memberId } = req.params;
    const { action } = req.body; // 'ACCEPT' or 'REJECT'
    const userId = req.user.id;

    const memberRecord = await prisma.projectMember.findFirst({
      where: {
        id: memberId,
        projectId: id,
        userId
      },
      include: { project: true }
    });

    if (!memberRecord) {
      return res.status(404).json({ success: false, message: 'Invitation record not found.' });
    }

    if (action === 'ACCEPT') {
      const updated = await prisma.projectMember.update({
        where: { id: memberId },
        data: { status: 'ACCEPTED' }
      });

      // Notify project owner
      await prisma.notification.create({
        data: {
          userId: memberRecord.project.ownerId,
          type: 'PROJECT',
          title: 'Invitation Accepted! 🎉',
          message: `${req.user.name} joined your project "${memberRecord.project.title}".`,
          link: `/projects/${id}`
        }
      });

      return res.json({ success: true, message: 'You have joined the project!', member: updated });
    } else {
      await prisma.projectMember.delete({ where: { id: memberId } });
      return res.json({ success: true, message: 'Invitation declined.' });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  inviteMember,
  respondInvite
};
