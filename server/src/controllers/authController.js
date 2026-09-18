const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');

// Calculate profile completion percentage
function calculateCompletion(user, profile, skillsCount) {
  let score = 20; // Base for registering
  if (user.bio && user.bio.trim().length > 10) score += 15;
  if (user.college) score += 10;
  if (user.avatar) score += 10;
  if (user.githubUrl) score += 15;
  if (user.linkedinUrl) score += 10;
  if (skillsCount > 0) score += 20;
  return Math.min(score, 100);
}

// Generate JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Register a new user
 */
async function register(req, res, next) {
  try {
    const { name, email, password, college, bio, githubUrl, teachSkills = [], learnSkills = [] } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with profile
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        college: college ? college.trim() : null,
        bio: bio ? bio.trim() : null,
        githubUrl: githubUrl ? githubUrl.trim() : null,
        role: 'STUDENT',
        profile: {
          create: {
            profileCompletion: 40,
            badges: 'Student Pioneer'
          }
        }
      },
      include: {
        profile: true
      }
    });

    // Add teach skills if provided
    for (const skillName of teachSkills) {
      let skill = await prisma.skill.findUnique({ where: { name: skillName } });
      if (!skill) {
        skill = await prisma.skill.create({ data: { name: skillName, category: 'General' } });
      }
      await prisma.userSkill.create({
        data: {
          userId: newUser.id,
          skillId: skill.id,
          type: 'TEACH',
          level: 'INTERMEDIATE'
        }
      });
    }

    // Add learn skills if provided
    for (const skillName of learnSkills) {
      let skill = await prisma.skill.findUnique({ where: { name: skillName } });
      if (!skill) {
        skill = await prisma.skill.create({ data: { name: skillName, category: 'General' } });
      }
      await prisma.userSkill.create({
        data: {
          userId: newUser.id,
          skillId: skill.id,
          type: 'LEARN',
          level: 'BEGINNER'
        }
      });
    }

    // Update profile completion
    const totalSkills = teachSkills.length + learnSkills.length;
    const completion = calculateCompletion(newUser, newUser.profile, totalSkills);
    await prisma.profile.update({
      where: { userId: newUser.id },
      data: { profileCompletion: completion }
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        type: 'SYSTEM',
        title: 'Welcome to SkillBridge! 🚀',
        message: 'Explore compatible skill partners, join collaborative projects, or consult your AI Learning Assistant.',
        link: '/skills'
      }
    });

    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        college: newUser.college,
        bio: newUser.bio,
        avatar: newUser.avatar,
        githubUrl: newUser.githubUrl,
        profile: {
          ...newUser.profile,
          profileCompletion: completion
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Login existing user
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        profile: true,
        skills: {
          include: { skill: true }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'This account has been suspended. Please contact platform support.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user.id);

    const { passwordHash, ...userSafe } = user;

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: userSafe
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current authenticated user details
 */
async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
        skills: {
          include: { skill: true }
        },
        learningGoals: {
          orderBy: { createdAt: 'desc' }
        },
        portfolioProjects: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Count unread notifications & unread messages
    const unreadNotifications = await prisma.notification.count({
      where: { userId: user.id, isRead: false }
    });

    const unreadMessages = await prisma.message.count({
      where: { receiverId: user.id, isRead: false }
    });

    const { passwordHash, ...userSafe } = user;

    res.json({
      success: true,
      user: {
        ...userSafe,
        unreadNotifications,
        unreadMessages
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update authenticated user profile
 */
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, bio, college, avatar, githubUrl, linkedinUrl, graduationYear, major, interests } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name: name.trim() }),
        ...(bio !== undefined && { bio: bio?.trim() }),
        ...(college !== undefined && { college: college?.trim() }),
        ...(avatar !== undefined && { avatar: avatar?.trim() }),
        ...(githubUrl !== undefined && { githubUrl: githubUrl?.trim() }),
        ...(linkedinUrl !== undefined && { linkedinUrl: linkedinUrl?.trim() })
      },
      include: {
        profile: true,
        skills: true
      }
    });

    // Update Profile details
    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: {
        ...(graduationYear !== undefined && { graduationYear: graduationYear ? Number(graduationYear) : null }),
        ...(major !== undefined && { major: major?.trim() }),
        ...(interests !== undefined && { interests: interests?.trim() })
      },
      create: {
        userId,
        graduationYear: graduationYear ? Number(graduationYear) : null,
        major: major?.trim(),
        interests: interests?.trim()
      }
    });

    // Recalculate completion
    const completion = calculateCompletion(updatedUser, updatedProfile, updatedUser.skills.length);
    await prisma.profile.update({
      where: { userId },
      data: { profileCompletion: completion }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        ...updatedUser,
        profile: {
          ...updatedProfile,
          profileCompletion: completion
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
