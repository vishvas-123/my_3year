const prisma = require('../config/prisma');

/**
 * Calculates matching score and recommendations between a student and other platform students.
 * @param {string} currentUserId
 * @param {object} filters - optional filters like college, minScore, skill
 */
async function getStudentMatches(currentUserId, filters = {}) {
  // Fetch current user's skills
  const currentUserSkills = await prisma.userSkill.findMany({
    where: { userId: currentUserId },
    include: { skill: true }
  });

  const myTeachSkills = currentUserSkills.filter(s => s.type === 'TEACH');
  const myLearnSkills = currentUserSkills.filter(s => s.type === 'LEARN');

  const myTeachSkillNames = new Set(myTeachSkills.map(s => s.skill.name.toLowerCase()));
  const myLearnSkillNames = new Set(myLearnSkills.map(s => s.skill.name.toLowerCase()));

  // Fetch current user details
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { college: true }
  });

  // Fetch all other active students
  const otherUsers = await prisma.user.findMany({
    where: {
      id: { not: currentUserId },
      status: 'ACTIVE',
      role: 'STUDENT',
      ...(filters.college ? { college: { contains: filters.college } } : {})
    },
    include: {
      profile: true,
      skills: {
        include: { skill: true }
      },
      sentConnections: {
        where: { receiverId: currentUserId }
      },
      receivedConnections: {
        where: { requesterId: currentUserId }
      }
    }
  });

  const matches = [];

  for (const other of otherUsers) {
    const theirTeachSkills = other.skills.filter(s => s.type === 'TEACH');
    const theirLearnSkills = other.skills.filter(s => s.type === 'LEARN');

    const theirTeachSkillNames = new Set(theirTeachSkills.map(s => s.skill.name.toLowerCase()));
    const theirLearnSkillNames = new Set(theirLearnSkills.map(s => s.skill.name.toLowerCase()));

    // Skills I can teach them (my teach & their learn)
    const iCanTeachThem = myTeachSkills.filter(s => theirLearnSkillNames.has(s.skill.name.toLowerCase()));

    // Skills they can teach me (their teach & my learn)
    const theyCanTeachMe = theirTeachSkills.filter(s => myLearnSkillNames.has(s.skill.name.toLowerCase()));

    // Determine connection status
    let connectionStatus = 'NONE';
    let connectionId = null;

    if (other.sentConnections.length > 0) {
      connectionStatus = other.sentConnections[0].status;
      connectionId = other.sentConnections[0].id;
    } else if (other.receivedConnections.length > 0) {
      connectionStatus = other.receivedConnections[0].status;
      connectionId = other.receivedConnections[0].id;
    }

    // Filter by specific skill if requested
    if (filters.skill) {
      const targetSkill = filters.skill.toLowerCase();
      const hasSkill = other.skills.some(s => s.skill.name.toLowerCase().includes(targetSkill));
      if (!hasSkill) continue;
    }

    // Filter by skill level if requested
    if (filters.level) {
      const hasLevel = other.skills.some(s => s.level.toUpperCase() === filters.level.toUpperCase());
      if (!hasLevel) continue;
    }

    // Calculate complementary score
    let score = 0;
    const totalPotentialMatches = Math.max(myLearnSkills.length + theirLearnSkills.length, 1);
    const mutualMatchesCount = iCanTeachThem.length + theyCanTeachMe.length;

    if (iCanTeachThem.length > 0 && theyCanTeachMe.length > 0) {
      // Direct two-way complementary match gets high base score
      score = 50 + Math.min(40, (mutualMatchesCount / totalPotentialMatches) * 50);
    } else if (theyCanTeachMe.length > 0) {
      // They know what I want to learn
      score = 30 + (theyCanTeachMe.length * 15);
    } else if (iCanTeachThem.length > 0) {
      // I can teach what they want
      score = 20 + (iCanTeachThem.length * 10);
    } else {
      // No direct teach/learn overlap; baseline interest compatibility
      score = 10;
    }

    // College bonus (+5% if same college)
    if (currentUser?.college && other.college && currentUser.college.toLowerCase() === other.college.toLowerCase()) {
      score += 5;
    }

    // Profile completion bonus
    if (other.profile?.profileCompletion) {
      score += Math.round((other.profile.profileCompletion / 100) * 5);
    }

    score = Math.min(Math.round(score), 99);

    if (filters.minScore && score < Number(filters.minScore)) {
      continue;
    }

    matches.push({
      user: {
        id: other.id,
        name: other.name,
        email: other.email,
        college: other.college,
        bio: other.bio,
        avatar: other.avatar,
        githubUrl: other.githubUrl,
        linkedinUrl: other.linkedinUrl,
        profile: other.profile
      },
      matchScore: score,
      iCanTeachThem: iCanTeachThem.map(s => ({ name: s.skill.name, level: s.level })),
      theyCanTeachMe: theyCanTeachMe.map(s => ({ name: s.skill.name, level: s.level })),
      teachSkills: theirTeachSkills.map(s => ({ name: s.skill.name, level: s.level, category: s.skill.category })),
      learnSkills: theirLearnSkills.map(s => ({ name: s.skill.name, level: s.level, category: s.skill.category })),
      connectionStatus,
      connectionId
    });
  }

  // Sort by highest match score descending
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches;
}

module.exports = {
  getStudentMatches
};
