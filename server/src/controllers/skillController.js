const prisma = require('../config/prisma');
const { getStudentMatches } = require('../services/matchingService');

/**
 * Get all available skills in platform
 */
async function getAllSkills(req, res, next) {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { userSkills: true }
        }
      }
    });

    res.json({ success: true, skills });
  } catch (err) {
    next(err);
  }
}

/**
 * Search skills
 */
async function searchSkills(req, res, next) {
  try {
    const { query = '' } = req.query;

    const skills = await prisma.skill.findMany({
      where: {
        name: { contains: query }
      },
      take: 20
    });

    res.json({ success: true, skills });
  } catch (err) {
    next(err);
  }
}

/**
 * Get complementary skill matches for the logged-in student
 */
async function getMatches(req, res, next) {
  try {
    const currentUserId = req.user.id;
    const { skill, college, level, minScore } = req.query;

    const matches = await getStudentMatches(currentUserId, {
      skill,
      college,
      level,
      minScore
    });

    res.json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get top recommended partners for student dashboard
 */
async function getDashboardRecommendations(req, res, next) {
  try {
    const currentUserId = req.user.id;
    const matches = await getStudentMatches(currentUserId);

    // Return top 4 compatible partners
    res.json({
      success: true,
      recommendations: matches.slice(0, 4)
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllSkills,
  searchSkills,
  getMatches,
  getDashboardRecommendations
};
