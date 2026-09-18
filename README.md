# SkillBridge — Student Skill Exchange & Project Collaboration Platform

> **"Learn Together. Build Together. Grow Together."**

SkillBridge is a modern, production-ready full-stack web application designed for college students to exchange skills, find reciprocal learning partners, co-create real-world software projects, manage tasks on interactive Kanban boards, chat in real-time, and get AI-powered learning guidance.

---

## 🚀 Key Features

1. **Modern Landing Page**
   - Professional branding with gradient hero banner.
   - Interactive live Skill Match Simulator (e.g., Python $\leftrightarrow$ React matching).
   - 4-step workflow guide, features grid, testimonials, and platform statistics.

2. **Authentication & Security**
   - Student & Admin registration with university affiliation and initial skills.
   - Secure password hashing with `bcryptjs`.
   - JWT authentication stored securely with automatic session restore.
   - Role-based route protection (`STUDENT` vs `ADMIN`).

3. **Student Dashboard**
   - Dynamic greeting and profile completion progress bar with actionable tips.
   - Dual skill cards: "Skills I Can Teach" vs "Skills I Want to Learn".
   - Personal learning goals tracker with one-click completion checkboxes and confetti.
   - Top recommended skill partners with compatibility score and 1-click connect.
   - Active collaborative projects with progress rings and task counts.

4. **Skill Exchange & Reciprocal Matchmaking**
   - Search students by skill keyword (e.g. React, Python, Flutter, Docker).
   - Filter by college affiliation and skill proficiency level (Beginner to Expert).
   - Complementary matchmaking score:
     $$\text{Match Score} = \frac{|\text{Teach}(A) \cap \text{Learn}(B)| + |\text{Learn}(A) \cap \text{Teach}(B)|}{\max(|\text{Learn}(A)| + |\text{Learn}(B)|, 1)} \times 100\%$$
   - Send personalized connection invitations, manage pending requests, and connect.

5. **Project Collaboration & Kanban Workspace**
   - Launch collaborative projects with tech stack tags, GitHub, and live URLs.
   - Team member roster and invite modal.
   - Interactive Kanban Board (To Do, In Progress, Done) with priority tags and assignee avatars.
   - Real-time task status updates and sprint progress percentage meter.

6. **Real-Time Chat (Socket.IO)**
   - One-to-one direct student messaging.
   - Project team repository channels.
   - Active typing indicators and online presence status.
   - Timestamped message history persisted in PostgreSQL / SQLite.

7. **AI Learning Assistant**
   - Conversational AI engineering mentor powered by Google Gemini (`gemini-1.5-flash`).
   - Secure backend integration via environment variables.
   - Contextual intelligent fallback engine for 100% functionality without API keys.
   - Dedicated 4-week structured roadmap generator and collaborative project ideas builder.

8. **Student Portfolio & Public Profile**
   - Public view (`/profile/:id`) showcasing student skills, bio, college, and badges.
   - Portfolio project cards linking to GitHub repos and live web deployments.
   - Verified skill badges (e.g. "Python Wizard", "React Specialist", "Student Pioneer").

9. **Administrator Console**
   - Platform analytics: total users, active projects, connection requests, total messages.
   - Student directory table with search, role toggle (`STUDENT` / `ADMIN`), and account suspension.
   - Project repository moderation and removal.

10. **Modern UI/UX & Dark Mode**
    - Built with Tailwind CSS and Lucide React icons.
    - Full dark mode toggle with local persistence.
    - Fully responsive across desktop, tablet, and mobile displays.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React, React Router v7, Axios, Socket.IO Client, Canvas Confetti |
| **Backend** | Node.js, Express.js, Socket.IO Server, JWT, Bcrypt, CORS, Dotenv |
| **Database & ORM** | PostgreSQL / SQLite, Prisma ORM (v6) |
| **AI Integration** | Google Gemini API (`gemini-1.5-flash`) + Intelligent Contextual Fallback Engine |

---

## 🗄️ Database Models (Prisma)

The platform is designed around 12 relational models:

1. `User` — Authentication credentials, role, college affiliation, bio, social links.
2. `Profile` — Profile completion percentage, graduation year, major, earned badges.
3. `Skill` — Master skill catalog categorized by domain (Frontend, Backend, Database, AI/ML, etc.).
4. `UserSkill` — Student skill relations tagged with `TEACH` or `LEARN` and proficiency levels.
5. `LearningGoal` — Student learning milestones with target dates and completion status.
6. `Project` — Collaborative projects with tech stack, owner, repository, and live demo links.
7. `ProjectMember` — Project team collaborators, roles (`OWNER` / `COLLABORATOR`), and invite status.
8. `Task` — Kanban board tasks categorized as `TODO`, `IN_PROGRESS`, or `DONE` with priority.
9. `Connection` — Student peer connections with statuses (`PENDING`, `ACCEPTED`, `REJECTED`).
10. `Message` — Real-time 1-on-1 and project group chat messages.
11. `Notification` — Real-time event notifications for connections, tasks, invites, and chats.
12. `PortfolioProject` — Showcase student projects featured on public profiles.

---

## 👥 Demo Accounts (Pre-Seeded)

The database comes pre-seeded with realistic student profiles ready for testing:

| Role | Name | Email | Password | Primary Skills |
|---|---|---|---|---|
| **Student** | Alex Rivera | `alex.rivera@tech.edu` | `password123` | Teaches: Python, Django / Learns: React |
| **Student** | Priya Sharma | `priya.sharma@stanford.edu` | `password123` | Teaches: React, Tailwind / Learns: Python |
| **Student** | Marcus Chen | `marcus.chen@berkeley.edu` | `password123` | Teaches: Flutter / Learns: Node.js, Docker |
| **Student** | Sarah Jenkins | `sarah.j@cmu.edu` | `password123` | Teaches: Figma, UI/UX / Learns: DSA, Next.js |
| **Admin** | Admin Moderator | `admin@skillbridge.edu` | `password123` | Platform Administrator |

> 💡 **Tip**: On the Login page, click any of the 1-click **Quick Demo Account** pills to automatically fill credentials.

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Quick Local Start (Works Out-Of-The-Box)

The application is pre-configured with SQLite for zero-setup execution. You can run the entire platform immediately:

```bash
# 1. Start the Backend API & Socket.IO server
cd server
npm run dev

# 2. In a second terminal, start the Frontend client
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

### 2. Switching to PostgreSQL (Production Mode)

If you prefer to connect to a PostgreSQL database (local PostgreSQL, Docker, Neon, or Supabase):

1. Start local PostgreSQL via Docker:
   ```bash
   docker-compose up -d
   ```

2. Open `server/.env` and update the `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://postgres:password123@localhost:5432/skillbridge?schema=public"
   ```

3. Copy the PostgreSQL schema file:
   ```bash
   cd server
   cp prisma/schema.postgresql.prisma prisma/schema.prisma
   npx prisma db push
   node prisma/seed.js
   ```

### 3. AI Assistant Configuration (Optional)

The AI Learning Assistant works **automatically out of the box** using SkillBridge's intelligent offline fallback engine. To enable live Google Gemini LLM queries:

1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Open `server/.env` and paste your key:
   ```env
   GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
   ```
3. Restart the backend server.

---

## 🧪 Testing the User Flows

- **Skill Exchange**: Log in as **Alex Rivera** (`alex.rivera@tech.edu`). Go to **Skill Exchange**. You will see **Priya Sharma** as a **95% reciprocal match** (Alex teaches Python & wants React; Priya teaches React & wants Python!).
- **Kanban Tasks**: Open the **Projects** tab, click into **StudyBuddy**, and drag/move tasks across To Do, In Progress, and Done to watch progress update with confetti!
- **Real-time Chat**: Open the **Real-Time Chat** tab to message connected peers or collaborate in project group chats.
- **AI Assistant**: Open the **AI Assistant** tab and click any quick prompt to generate a 4-week roadmap or ask code questions.
- **Admin Console**: Log in as **`admin@skillbridge.edu`** and open the **Admin** console to inspect platform metrics, toggle student roles, and moderate projects.

---

## 📄 License

MIT License &copy; 2026 SkillBridge Team. Built for student innovation and peer collaboration.
