const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SkillBridge database...');

  // 1. Clean existing records (in reverse dependency order)
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.portfolioProject.deleteMany();
  await prisma.project.deleteMany();
  await prisma.learningGoal.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Seed Skills
  const skillsData = [
    { name: 'React', category: 'Frontend', icon: 'Atom' },
    { name: 'JavaScript', category: 'Frontend', icon: 'FileCode' },
    { name: 'TypeScript', category: 'Frontend', icon: 'Code' },
    { name: 'Next.js', category: 'Frontend', icon: 'Globe' },
    { name: 'Tailwind CSS', category: 'Frontend', icon: 'Palette' },
    { name: 'Python', category: 'Backend', icon: 'Terminal' },
    { name: 'Node.js', category: 'Backend', icon: 'Server' },
    { name: 'Express.js', category: 'Backend', icon: 'Cpu' },
    { name: 'Django', category: 'Backend', icon: 'Layers' },
    { name: 'FastAPI', category: 'Backend', icon: 'Zap' },
    { name: 'PostgreSQL', category: 'Database', icon: 'Database' },
    { name: 'MongoDB', category: 'Database', icon: 'HardDrive' },
    { name: 'Machine Learning', category: 'AI/ML', icon: 'Brain' },
    { name: 'PyTorch', category: 'AI/ML', icon: 'Flame' },
    { name: 'Flutter', category: 'Mobile', icon: 'Smartphone' },
    { name: 'React Native', category: 'Mobile', icon: 'Smartphone' },
    { name: 'Docker', category: 'DevOps', icon: 'Box' },
    { name: 'Figma', category: 'UI/UX', icon: 'Figma' },
    { name: 'UI/UX Design', category: 'UI/UX', icon: 'PenTool' },
    { name: 'Data Structures & Algorithms', category: 'CS Fundamentals', icon: 'Binary' }
  ];

  const createdSkills = {};
  for (const s of skillsData) {
    const created = await prisma.skill.create({ data: s });
    createdSkills[s.name] = created.id;
  }
  console.log(`✅ Created ${skillsData.length} skills.`);

  // 3. Seed Users & Profiles
  const usersData = [
    {
      name: 'Admin Moderator',
      email: 'admin@skillbridge.edu',
      passwordHash,
      role: 'ADMIN',
      college: 'SkillBridge University',
      bio: 'Platform administrator ensuring quality peer collaboration and campus safety.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      githubUrl: 'https://github.com/skillbridge',
      linkedinUrl: 'https://linkedin.com/company/skillbridge',
      profile: {
        graduationYear: 2024,
        major: 'Computer Science & Academic Operations',
        interests: 'System Administration, Peer Learning, Open Source',
        profileCompletion: 100,
        badges: 'Platform Guardian, Verified Admin'
      }
    },
    {
      name: 'Alex Rivera',
      email: 'alex.rivera@tech.edu',
      passwordHash,
      role: 'STUDENT',
      college: 'MIT Tech Institute',
      bio: 'Backend enthusiast proficient in Python & Django. Excited to learn modern React and build scalable full-stack applications.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      githubUrl: 'https://github.com/alexrivera-dev',
      linkedinUrl: 'https://linkedin.com/in/alexriveradev',
      profile: {
        graduationYear: 2026,
        major: 'Computer Science',
        interests: 'Distributed Systems, Microservices, Web Dev',
        profileCompletion: 90,
        badges: 'Python Wizard, Code Reviewer'
      },
      teachSkills: [
        { skill: 'Python', level: 'EXPERT' },
        { skill: 'Django', level: 'ADVANCED' },
        { skill: 'PostgreSQL', level: 'INTERMEDIATE' }
      ],
      learnSkills: [
        { skill: 'React', level: 'BEGINNER' },
        { skill: 'Tailwind CSS', level: 'BEGINNER' }
      ],
      goals: [
        { title: 'Master React Hooks and Component Lifecycle', description: 'Build 3 functional frontends using React 18' },
        { title: 'Deploy a Full-Stack Microservice', description: 'Containerize backend and connect with modern frontend' }
      ]
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@stanford.edu',
      passwordHash,
      role: 'STUDENT',
      college: 'Stanford Engineering',
      bio: 'Frontend developer and UI lover building sleek interactive experiences in React & Next.js. Wanting to learn Python & AI/ML fundamentals.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      githubUrl: 'https://github.com/priyasharma-code',
      linkedinUrl: 'https://linkedin.com/in/priyasharmadev',
      profile: {
        graduationYear: 2026,
        major: 'Software Engineering',
        interests: 'Design Systems, Human-Computer Interaction, AI',
        profileCompletion: 95,
        badges: 'React Specialist, UI Crafter'
      },
      teachSkills: [
        { skill: 'React', level: 'EXPERT' },
        { skill: 'Tailwind CSS', level: 'EXPERT' },
        { skill: 'JavaScript', level: 'ADVANCED' }
      ],
      learnSkills: [
        { skill: 'Python', level: 'BEGINNER' },
        { skill: 'Machine Learning', level: 'BEGINNER' }
      ],
      goals: [
        { title: 'Learn Python syntax and NumPy/Pandas', description: 'Gain confidence to understand machine learning algorithms' },
        { title: 'Build a personalized AI study companion', description: 'Integrate LLMs with React frontends' }
      ]
    },
    {
      name: 'Marcus Chen',
      email: 'marcus.chen@berkeley.edu',
      passwordHash,
      role: 'STUDENT',
      college: 'UC Berkeley',
      bio: 'Mobile app builder specializing in Flutter. Seeking to exchange mobile development experience for solid Node.js & cloud infrastructure skills.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      githubUrl: 'https://github.com/marcuschen-dev',
      linkedinUrl: 'https://linkedin.com/in/marcuschen',
      profile: {
        graduationYear: 2027,
        major: 'Electrical Engineering & Computer Science',
        interests: 'Cross-platform Mobile, Cloud Computing, Edge AI',
        profileCompletion: 85,
        badges: 'Mobile Hacker, Flutter Enthusiast'
      },
      teachSkills: [
        { skill: 'Flutter', level: 'ADVANCED' },
        { skill: 'JavaScript', level: 'INTERMEDIATE' }
      ],
      learnSkills: [
        { skill: 'Node.js', level: 'INTERMEDIATE' },
        { skill: 'Docker', level: 'BEGINNER' }
      ],
      goals: [
        { title: 'Build robust REST APIs with Express & Postgres', description: 'Learn token auth and relational database design' }
      ]
    },
    {
      name: 'Sarah Jenkins',
      email: 'sarah.j@cmu.edu',
      passwordHash,
      role: 'STUDENT',
      college: 'Carnegie Mellon University',
      bio: 'Product Designer turned frontend coder. Love turning Figma designs into accessible React code. Eager to master DSA and Next.js.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      githubUrl: 'https://github.com/sarahjenkins-design',
      linkedinUrl: 'https://linkedin.com/in/sarahjenkins',
      profile: {
        graduationYear: 2025,
        major: 'Information Systems & HCI',
        interests: 'Accessibility, Design Systems, Frontend Tech',
        profileCompletion: 90,
        badges: 'Design Maestro, Accessibility Champion'
      },
      teachSkills: [
        { skill: 'Figma', level: 'EXPERT' },
        { skill: 'UI/UX Design', level: 'EXPERT' },
        { skill: 'Tailwind CSS', level: 'ADVANCED' }
      ],
      learnSkills: [
        { skill: 'Data Structures & Algorithms', level: 'INTERMEDIATE' },
        { skill: 'Next.js', level: 'INTERMEDIATE' }
      ],
      goals: [
        { title: 'Solve 100 LeetCode problems in JS/Python', description: 'Prepare for technical internship interviews' }
      ]
    }
  ];

  const createdUsers = {};

  for (const u of usersData) {
    const { profile, teachSkills = [], learnSkills = [], goals = [], ...userData } = u;
    const user = await prisma.user.create({
      data: {
        ...userData,
        profile: {
          create: profile
        }
      }
    });
    createdUsers[user.email] = user;

    // Add teach skills
    for (const ts of teachSkills) {
      if (createdSkills[ts.skill]) {
        await prisma.userSkill.create({
          data: {
            userId: user.id,
            skillId: createdSkills[ts.skill],
            type: 'TEACH',
            level: ts.level
          }
        });
      }
    }

    // Add learn skills
    for (const ls of learnSkills) {
      if (createdSkills[ls.skill]) {
        await prisma.userSkill.create({
          data: {
            userId: user.id,
            skillId: createdSkills[ls.skill],
            type: 'LEARN',
            level: ls.level
          }
        });
      }
    }

    // Add learning goals
    for (const g of goals) {
      await prisma.learningGoal.create({
        data: {
          userId: user.id,
          title: g.title,
          description: g.description,
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
    }
  }
  console.log(`✅ Created ${usersData.length} users with profiles, skills, and goals.`);

  const alex = createdUsers['alex.rivera@tech.edu'];
  const priya = createdUsers['priya.sharma@stanford.edu'];
  const marcus = createdUsers['marcus.chen@berkeley.edu'];
  const sarah = createdUsers['sarah.j@cmu.edu'];

  // 4. Seed Connections
  await prisma.connection.create({
    data: {
      requesterId: alex.id,
      receiverId: priya.id,
      status: 'ACCEPTED',
      note: 'Hey Priya! I saw you want to learn Python and you know React. I can teach you Python in exchange for React guidance!'
    }
  });

  await prisma.connection.create({
    data: {
      requesterId: marcus.id,
      receiverId: alex.id,
      status: 'PENDING',
      note: 'Hi Alex, would love to collaborate on a backend service for mobile apps!'
    }
  });

  // 5. Seed Projects
  const project1 = await prisma.project.create({
    data: {
      title: 'StudyBuddy — AI Peer Study Session Matcher',
      description: 'An intelligent collaboration app that matches college students for focused 45-minute virtual study sessions using AI prompt matching.',
      techStack: 'React, Node.js, Express, PostgreSQL, Socket.IO',
      status: 'IN_PROGRESS',
      ownerId: priya.id,
      githubUrl: 'https://github.com/skillbridge/study-buddy-ai',
      liveUrl: 'https://studybuddy-demo.edu',
      members: {
        create: [
          { userId: priya.id, role: 'OWNER', status: 'ACCEPTED' },
          { userId: alex.id, role: 'COLLABORATOR', status: 'ACCEPTED' },
          { userId: sarah.id, role: 'COLLABORATOR', status: 'ACCEPTED' }
        ]
      }
    }
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'CampusEats — Sustainable Food Sharing Portal',
      description: 'A campus marketplace enabling university clubs and dining halls to redistribute leftover event food to students to eliminate waste.',
      techStack: 'Flutter, Node.js, PostgreSQL, Docker',
      status: 'PLANNING',
      ownerId: marcus.id,
      githubUrl: 'https://github.com/skillbridge/campus-eats',
      members: {
        create: [
          { userId: marcus.id, role: 'OWNER', status: 'ACCEPTED' }
        ]
      }
    }
  });

  console.log('✅ Created initial projects and team members.');

  // 6. Seed Tasks for Project 1
  const tasks = [
    {
      projectId: project1.id,
      title: 'Design UI mockups for Study Session lobby',
      description: 'Create high-fidelity Figma components for the countdown timer and participant list.',
      status: 'DONE',
      priority: 'HIGH',
      assignedToId: sarah.id,
      createdById: priya.id
    },
    {
      projectId: project1.id,
      title: 'Implement JWT authentication & protected routes',
      description: 'Setup token generation, refresh logic, and user session verification middleware.',
      status: 'DONE',
      priority: 'HIGH',
      assignedToId: alex.id,
      createdById: priya.id
    },
    {
      projectId: project1.id,
      title: 'Build real-time Socket.IO room matchmaking',
      description: 'Create socket handlers for students queuing into matching rooms and exchanging state.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assignedToId: priya.id,
      createdById: priya.id
    },
    {
      projectId: project1.id,
      title: 'PostgreSQL schema optimization & database indexing',
      description: 'Add composite indexes on user matching scores and session timestamps.',
      status: 'TODO',
      priority: 'MEDIUM',
      assignedToId: alex.id,
      createdById: priya.id
    },
    {
      projectId: project1.id,
      title: 'Prepare presentation deck & demo deployment',
      description: 'Finalize presentation slides and setup Vercel/Render hosting pipeline.',
      status: 'TODO',
      priority: 'LOW',
      assignedToId: sarah.id,
      createdById: priya.id
    }
  ];

  for (const t of tasks) {
    await prisma.task.create({ data: t });
  }
  console.log(`✅ Created ${tasks.length} tasks for project.`);

  // 7. Seed Messages
  await prisma.message.create({
    data: {
      senderId: alex.id,
      receiverId: priya.id,
      content: 'Hey Priya! Thanks for connecting. Excited to start our skill exchange!'
    }
  });
  await prisma.message.create({
    data: {
      senderId: priya.id,
      receiverId: alex.id,
      content: 'Hey Alex! Delighted to connect. I will help you with React component architecture, and looking forward to your Python tips!'
    }
  });

  // Project team message
  await prisma.message.create({
    data: {
      senderId: priya.id,
      projectId: project1.id,
      content: 'Team, welcome to StudyBuddy! Let us aim to finish the real-time matching sprint by Friday.'
    }
  });
  await prisma.message.create({
    data: {
      senderId: sarah.id,
      projectId: project1.id,
      content: 'The Figma designs are ready and linked in the project description!'
    }
  });

  // 8. Seed Portfolio Projects
  await prisma.portfolioProject.create({
    data: {
      userId: alex.id,
      title: 'FastAPI Microservice Engine',
      description: 'High-throughput async event processor built with Python, FastAPI, Redis, and PostgreSQL.',
      techStack: 'Python, FastAPI, Redis, Docker',
      githubUrl: 'https://github.com/alexrivera-dev/fastapi-engine',
      liveUrl: 'https://api-engine.demo.dev',
      featured: true
    }
  });

  await prisma.portfolioProject.create({
    data: {
      userId: priya.id,
      title: 'OmniUI React Design System',
      description: 'Accessible, dark-mode first component library written in TypeScript with 40+ components.',
      techStack: 'React, TypeScript, Tailwind CSS, Storybook',
      githubUrl: 'https://github.com/priyasharma-code/omni-ui',
      liveUrl: 'https://omni-ui.demo.dev',
      featured: true
    }
  });

  // 9. Seed Notifications
  await prisma.notification.create({
    data: {
      userId: alex.id,
      type: 'CONNECTION',
      title: 'New Connection Request',
      message: 'Marcus Chen wants to connect with you regarding backend collaboration.',
      link: '/skills',
      isRead: false
    }
  });

  await prisma.notification.create({
    data: {
      userId: alex.id,
      type: 'PROJECT',
      title: 'Project Invitation Accepted',
      message: 'You are now an active collaborator on StudyBuddy — AI Peer Study Session Matcher.',
      link: `/projects/${project1.id}`,
      isRead: true
    }
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
