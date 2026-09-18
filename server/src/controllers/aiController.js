const { getAiResponse } = require('../services/aiService');

/**
 * Handle general AI chat prompt
 */
async function chat(req, res, next) {
  try {
    const { prompt } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt cannot be empty.' });
    }

    const aiResult = await getAiResponse(prompt.trim(), 'chat');

    res.json({
      success: true,
      data: aiResult
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Generate structured learning roadmap
 */
async function generateRoadmap(req, res, next) {
  try {
    const { targetSkill, currentLevel = 'Beginner', durationWeeks = 4 } = req.body;

    if (!targetSkill?.trim()) {
      return res.status(400).json({ success: false, message: 'Target skill is required.' });
    }

    const prompt = `Create a comprehensive, structured ${durationWeeks}-week learning roadmap for a student with ${currentLevel} experience who wants to master ${targetSkill}. Include week-by-week core concepts, hands-on milestones, recommended resources, and practice tasks.`;

    const aiResult = await getAiResponse(prompt, 'roadmap');

    res.json({
      success: true,
      data: aiResult
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Suggest collaborative project ideas
 */
async function suggestProjects(req, res, next) {
  try {
    const { skills = [], difficulty = 'Intermediate' } = req.body;

    const skillsString = skills.length > 0 ? skills.join(', ') : 'modern full-stack web technologies';
    const prompt = `Suggest 3 modern, collaborative project ideas for college students combining: ${skillsString} at ${difficulty} level. For each project, specify: Project Title, Overview, Recommended Tech Stack, Key Features, and how two students can divide the responsibilities.`;

    const aiResult = await getAiResponse(prompt, 'project');

    res.json({
      success: true,
      data: aiResult
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  chat,
  generateRoadmap,
  suggestProjects
};
