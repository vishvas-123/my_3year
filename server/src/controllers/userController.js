const prisma = require('../config/prisma');

/**
 * Get public profile of any student by user ID
 */
async function getPublicProfile(req, res, next) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        college: true,
        bio: true,
        avatar: true,
        githubUrl: true,
        linkedinUrl: true,
        createdAt: true,
        profile: true,
        skills: {
          include: { skill: true }
        },
        learningGoals: {
          where: { isCompleted: true },
          take: 5
        },
        portfolioProjects: {
          orderBy: { createdAt: 'desc' }
        },
        ownedProjects: {
          where: { status: 'COMPLETED' },
          select: { id: true, title: true, description: true, techStack: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    res.json({ success: true, profile: user });
  } catch (err) {
    next(err);
  }
}

/**
 * Add or update a user skill (TEACH or LEARN)
 */
async function addUserSkill(req, res, next) {
  try {
    const userId = req.user.id;
    const { skillName, category = 'General', type, level = 'INTERMEDIATE' } = req.body;

    if (!skillName || !type) {
      return res.status(400).json({ success: false, message: 'Skill name and type (TEACH or LEARN) are required.' });
    }

    // Upsert skill in master list
    let skill = await prisma.skill.findUnique({
      where: { name: skillName.trim() }
    });

    if (!skill) {
      skill = await prisma.skill.create({
        data: {
          name: skillName.trim(),
          category: category.trim()
        }
      });
    }

    // Upsert user skill
    const userSkill = await prisma.userSkill.upsert({
      where: {
        userId_skillId_type: {
          userId,
          skillId: skill.id,
          type: type.toUpperCase()
        }
      },
      update: {
        level: level.toUpperCase()
      },
      create: {
        userId,
        skillId: skill.id,
        type: type.toUpperCase(),
        level: level.toUpperCase()
      },
      include: {
        skill: true
      }
    });

    res.status(201).json({ success: true, message: 'Skill updated successfully!', userSkill });
  } catch (err) {
    next(err);
  }
}

/**
 * Remove a user skill
 */
async function removeUserSkill(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await prisma.userSkill.delete({
      where: {
        id,
        userId // ensure ownership
      }
    });

    res.json({ success: true, message: 'Skill removed successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * Add a learning goal
 */
async function addGoal(req, res, next) {
  try {
    const userId = req.user.id;
    const { title, description, targetDate } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Goal title is required.' });
    }

    const goal = await prisma.learningGoal.create({
      data: {
        userId,
        title: title.trim(),
        description: description?.trim(),
        targetDate: targetDate ? new Date(targetDate) : null
      }
    });

    res.status(201).json({ success: true, message: 'Learning goal created!', goal });
  } catch (err) {
    next(err);
  }
}

/**
 * Toggle goal completed state
 */
async function toggleGoal(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const goal = await prisma.learningGoal.findUnique({
      where: { id, userId }
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    const updatedGoal = await prisma.learningGoal.update({
      where: { id },
      data: { isCompleted: !goal.isCompleted }
    });

    res.json({ success: true, message: 'Goal status updated!', goal: updatedGoal });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a learning goal
 */
async function deleteGoal(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await prisma.learningGoal.delete({
      where: { id, userId }
    });

    res.json({ success: true, message: 'Goal deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * Add portfolio project
 */
async function addPortfolioProject(req, res, next) {
  try {
    const userId = req.user.id;
    const { title, description, techStack, githubUrl, liveUrl, featured = false } = req.body;

    if (!title || !description || !techStack) {
      return res.status(400).json({ success: false, message: 'Title, description, and tech stack are required.' });
    }

    const project = await prisma.portfolioProject.create({
      data: {
        userId,
        title: title.trim(),
        description: description.trim(),
        techStack: techStack.trim(),
        githubUrl: githubUrl?.trim() || null,
        liveUrl: liveUrl?.trim() || null,
        featured: Boolean(featured)
      }
    });

    res.status(201).json({ success: true, message: 'Portfolio project added!', project });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete portfolio project
 */
async function deletePortfolioProject(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await prisma.portfolioProject.delete({
      where: { id, userId }
    });

    res.json({ success: true, message: 'Portfolio project deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPublicProfile,
  addUserSkill,
  removeUserSkill,
  addGoal,
  toggleGoal,
  deleteGoal,
  addPortfolioProject,
  deletePortfolioProject
};
