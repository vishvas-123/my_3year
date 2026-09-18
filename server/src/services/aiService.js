const https = require('https');
const { GEMINI_API_KEY } = require('../config');

/**
 * Make API request to Gemini Generative Language API
 */
async function callGeminiApi(prompt, systemInstruction = '') {
  return new Promise((resolve, reject) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const requestBody = JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      systemInstruction: systemInstruction ? {
        parts: [{ text: systemInstruction }]
      } : undefined,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    });

    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const json = JSON.parse(data);
            const candidate = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidate) {
              resolve(candidate);
            } else {
              reject(new Error('Empty response from Gemini API'));
            }
          } else {
            reject(new Error(`Gemini API returned status ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini API request timed out'));
    });

    req.write(requestBody);
    req.end();
  });
}

/**
 * Intelligent contextual fallback engine when no Gemini API key is present or on API downtime.
 */
function generateFallbackResponse(prompt, type = 'chat') {
  const lower = prompt.toLowerCase();

  if (type === 'roadmap' || lower.includes('roadmap') || lower.includes('curriculum') || lower.includes('learn')) {
    // Extract target technology if mentioned
    let tech = 'Full-Stack Web Development';
    if (lower.includes('react')) tech = 'React & Modern Frontend';
    else if (lower.includes('python')) tech = 'Python & Backend Architecture';
    else if (lower.includes('machine learning') || lower.includes('ai')) tech = 'AI & Machine Learning Fundamentals';
    else if (lower.includes('dsa') || lower.includes('algorithm')) tech = 'Data Structures & Algorithms';
    else if (lower.includes('node')) tech = 'Node.js & Microservices';

    return `### 🗺️ 4-Week Personalized Learning Roadmap: ${tech}

#### **Week 1: Core Fundamentals & Mental Models**
- **Focus**: Syntax, execution model, foundational concepts, and project setup.
- **Key Concepts**:
  - Variable scoping, memory management, and asynchronous patterns.
  - Development tooling: Git workflows, linters, package managers.
- **Hands-On Milestone**: Build a simple command-line or single-page tool implementing pure functions and clean state.
- **Recommended Practice**: 5 small coding katas on variables, loops, and data structures.

---

#### **Week 2: Component Architecture & State Systems**
- **Focus**: Modular design, reusability, data flow, and error boundaries.
- **Key Concepts**:
  - Component decomposition and unidirectional data patterns.
  - Managing transient vs persistent application state.
  - RESTful API consumption and handling network states (loading, empty, error).
- **Hands-On Milestone**: Build an interactive CRUD application with client-side filtering and persistence.

---

#### **Week 3: Backend Integration & Persistence**
- **Focus**: Relational databases, authentication, security, and real-time events.
- **Key Concepts**:
  - Relational schema design (1-to-many, many-to-many) with Prisma ORM.
  - JWT token security, bcrypt hashing, and role-based access control.
  - WebSockets / Socket.IO for real-time notifications.
- **Hands-On Milestone**: Connect your frontend to an Express + PostgreSQL backend with protected routes.

---

#### **Week 4: Production Readiness & Portfolio Project**
- **Focus**: Optimization, testing, Docker containerization, and deployment.
- **Key Concepts**:
  - CI/CD pipelines, environment variable isolation, security headers.
  - End-to-end user workflows and responsive mobile-first UI polish.
- **Capstone Project**: Publish a portfolio-ready collaborative application on GitHub with full README documentation!
*(Note: Running in SkillBridge Intelligent Offline Mode. To use live Gemini LLM generation, set \`GEMINI_API_KEY\` in \`server/.env\`)*`;
  }

  if (type === 'project' || lower.includes('project') || lower.includes('idea')) {
    return `### 💡 High-Impact College Collaboration Project Ideas

Here are 3 production-grade project proposals tailored for student skill exchange:

#### 1. **CampusQuest — Peer Tutoring & Study Room Booking**
- **Tech Stack**: React, Tailwind CSS, Express, PostgreSQL, Socket.IO
- **Core Features**:
  - Real-time availability map of campus study rooms.
  - Booking calendar with clash prevention algorithm.
  - Peer study session chat with live whiteboarding notes.
- **Collaboration Angle**: Frontend developer designs the dynamic scheduler; backend developer designs the concurrency-safe booking logic.

---

#### 2. **Algoverse — Interactive Algorithm & Data Structure Visualizer**
- **Tech Stack**: React, TypeScript, Canvas API / SVG, Web Workers
- **Core Features**:
  - Step-by-step visual animation of Graph algorithms (Dijkstra, A*), Sorting, and Dynamic Programming.
  - Code sandbox allowing students to write custom code and watch it execute visually.
  - Time & space complexity performance meter.
- **Collaboration Angle**: Great for a student learning DSA paired with a frontend animation enthusiast!

---

#### 3. **DevConnect — Open Source College Contribution Matcher**
- **Tech Stack**: Node.js, Express, PostgreSQL, GitHub GraphQL API, React
- **Core Features**:
  - Scrapes "good first issue" tags from student university repositories.
  - Matches student skill levels to appropriate open issues.
  - Pull request review tracking and peer recognition badges.
*(Note: Running in SkillBridge Intelligent Offline Mode. To use live Gemini LLM generation, set \`GEMINI_API_KEY\` in \`server/.env\`)*`;
  }

  if (lower.includes('explain') || lower.includes('what is') || lower.includes('difference')) {
    return `### 🧠 Concept Explanation

Here is a clear, structured breakdown:

#### **1. High-Level Intuition**
Think of modern web architecture like an upscale restaurant:
- **Frontend (The Dining Area)**: The customer interface where users interact, browse options, and view feedback.
- **REST API (The Waitstaff)**: Takes user requests, validates them, and communicates with the kitchen.
- **Backend Server (The Kitchen)**: Processes the business logic, calculates matching algorithms, and enforces security.
- **Database (The Pantry)**: Safely stores persistent records (users, messages, project tasks) in organized relational tables.

#### **2. Practical Code Example**
\`\`\`javascript
// Asynchronous data handling with async/await and robust error handling
async function fetchSkillPartners(skillName) {
  try {
    const response = await fetch(\`/api/skills/matches?skill=\${encodeURIComponent(skillName)}\`, {
      headers: {
        'Authorization': \`Bearer \${token}\`
      }
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const data = await response.json();
    return data.matches;
  } catch (error) {
    console.error('Failed to retrieve skill partners:', error);
    return [];
  }
}
\`\`\`

#### **3. Common Pitfalls to Avoid**
1. **Unsafe state mutations**: Always create copies or use functional updates.
2. **Missing error boundaries**: Always handle loading, empty, and server error states gracefully.
3. **Exposing credentials**: Never embed secret keys in frontend client bundles!

*(Note: Running in SkillBridge Intelligent Offline Mode. To use live Gemini LLM generation, set \`GEMINI_API_KEY\` in \`server/.env\`)*`;
  }

  // General conversational assistant response
  return `### 👋 Hello from SkillBridge AI Learning Assistant!

I am here to accelerate your student learning journey and project collaboration. Here is how I can assist you today:

- 🗺️ **Personalized Roadmaps**: Ask me *"Create a roadmap to learn React & Node.js in 4 weeks"*.
- 💡 **Project Ideation**: Ask me *"Suggest full-stack project ideas for Python and PostgreSQL"*.
- 🔍 **Concept Explanations**: Ask me *"Explain the difference between SQL and NoSQL"* or *"How does Socket.IO work?"*.
- 💻 **Debugging & Code Review**: Paste your snippet or algorithm question and I will break it down step-by-step.
- 🎯 **Practice Challenges**: Ask me *"Give me 3 beginner backend coding tasks"*.

What skill or project would you like to explore together?

*(Note: SkillBridge AI Assistant is active. To enable live Gemini LLM queries, enter your \`GEMINI_API_KEY\` in \`server/.env\`)*`;
}

/**
 * Public AI service function that queries Gemini API if key is present,
 * otherwise returns rich contextual fallback responses.
 */
async function getAiResponse(prompt, type = 'chat') {
  if (GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 10) {
    try {
      const systemInstruction = `You are the SkillBridge AI Learning Assistant, an expert computer science mentor and software architect dedicated to helping college students learn programming, collaborate on projects, build portfolios, and exchange skills. Provide concise, clear, encouraging, and actionable answers. Use markdown formatting with clear headings and syntax-highlighted code blocks where appropriate.`;
      const response = await callGeminiApi(prompt, systemInstruction);
      return {
        content: response,
        provider: 'gemini-1.5-flash',
        isFallback: false
      };
    } catch (err) {
      console.warn('Gemini API call failed or timed out. Falling back to offline engine:', err.message);
      return {
        content: generateFallbackResponse(prompt, type),
        provider: 'skillbridge-fallback',
        isFallback: true,
        errorNotice: 'Gemini API temporarily unavailable; served from intelligent fallback engine.'
      };
    }
  }

  return {
    content: generateFallbackResponse(prompt, type),
    provider: 'skillbridge-fallback',
    isFallback: true
  };
}

module.exports = {
  getAiResponse
};
