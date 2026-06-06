# ⚡ JS.ACADEMY — Gamified JavaScript Learning Platform

**Live Production Link**: [https://java-script-learning-academy.vercel.app/](https://java-script-learning-academy.vercel.app/)

A professional, fully browser-based, gamified JavaScript learning platform for beginners. This project features structured modules, side-by-side sandboxed coding workspaces, MCQ quizzes, debugging exercises, peer-to-peer multiplayer battles, weekly contests, and AI-powered mentoring.

---

## 🚀 Key Architectural Strengths (Built for Scale)

1.  **Thread-Isolated Code Sandbox (`src/services/evaluator.ts`)**:
    Executes student-written code inside a browser **Web Worker** context. If the student writes a loop that doesn't terminate (e.g. `while(true)`), the evaluator detects the stall after 1.5 seconds and calls `worker.terminate()`. This prevents the entire browser tab from hanging.
2.  **Serverless P2P Multiplayer (`src/components/LiveBattle.tsx`)**:
    Leverages **WebRTC data channels** via PeerJS. Two players connect directly browser-to-browser to solve speed coding challenges. Includes synchronized timers, chat, and real-time typed character progression bars.
3.  **Dual-Mode AI Engine (`src/services/ai.ts`)**:
    Supports an out-of-the-box local rule simulator for code reviews and quiz recycling (100% free), as well as a live connection to the **Groq API** (Llama-3 models) for advanced code audits and infinite unique questions.
4.  **Flexible Content System (`src/data/curriculum.ts`)**:
    All modules, theories, MCQs, and unit tests are content-driven. Adding new subjects dynamically updates dashboards, progression locks, and certificates.

---

## 🛠️ Local Installation & Running

Ensure you have [Node.js](https://nodejs.org/) installed, then run:

```bash
# 1. Install dependencies
npm install

# 2. Start the hot-reloading development server
npm run dev
```

The app will launch at `http://localhost:5173`.

---

## 📦 Zero-Cost Deployment

To publish your learning platform online for free, link your GitHub repository to one of these free hosting services:

### Option A: Vercel (Recommended)
1. Go to [Vercel](https://vercel.com/) and create a free account.
2. Click **Add New** → **Project** and import your GitHub repository.
3. Keep default settings and click **Deploy**. Vercel will automatically trigger a new deployment every time you run `git push`!

### Option B: Netlify
1. Go to [Netlify](https://www.netlify.com/) and log in.
2. Select **Import from Git** and pick your repository.
3. Click **Deploy Site**.

---

## 🤖 Configuring Groq AI Mentor

1.  Sign up for a free console account at the [Groq Console](https://console.groq.com/).
2.  Go to the **API Keys** tab and generate a new key (format: `gsk_...`).
3.  Open your deployed JS.ACADEMY website, click the **Key icon** in the top navigation bar, paste your key, and click **Save**.
4.  Your key is stored securely in your browser's local sandbox (`localStorage`) and is never sent to any external server other than direct Groq endpoints.

---

## 📝 Tutorial: How to Add New Modules (Expanding the Platform)

To add new content (e.g., *DOM Manipulation* or *Array Destructuring*) and push it live to your users, follow these three steps:

### Step 1: Append a New Module in `src/data/curriculum.ts`
Open [curriculum.ts](file:///c:/Users/sujal/Desktop/Study%20Java%20Script%20Project/src/data/curriculum.ts) and add a new module block to the `curriculumModules` array. Here is a starter template:

```typescript
{
  id: "module-8", // Increment the ID (module-8, module-9...)
  title: "DOM Basics",
  description: "Learn how JavaScript interacts with HTML elements.",
  notes: `
    ## The Document Object Model (DOM)
    The DOM is an API for HTML documents...
    
    \`\`\`javascript
    const btn = document.getElementById("click-me");
    btn.textContent = "Clicked!";
    \`\`\`
  `,
  quiz: [
    {
      id: "m8-q1",
      question: "Which function selects elements by ID?",
      options: ["getElementById", "selectId", "querySelectorId", "findId"],
      answerIndex: 0 // Index of correct option (0-indexed)
    }
  ],
  debugging: {
    id: "m8-debug",
    description: "Fix the bug: the function should return the element's inner text, but it has a typo in textContent.",
    buggyCode: "function getTitleText() {\n  const el = document.getElementById('title');\n  return el.textContext; // BUG: textContext instead of textContent\n}",
    correctCode: "function getTitleText() {\n  const el = document.getElementById('title');\n  return el.textContent;\n}",
    testCases: [
      // Mock simulation or browser DOM test rules...
    ]
  },
  implementation: {
    id: "m8-impl",
    description: "Write a function 'doubleArrayElements(arr)' that returns a new array with all values doubled.",
    initialCode: "function doubleArrayElements(arr) {\n  // Write code here\n  \n}",
    testCases: [
      { input: [[1, 2, 3]], expected: [2, 4, 6], description: "doubleArrayElements([1, 2, 3])" }
    ]
  }
}
```

### Step 2: Push Changes to GitHub
Open your terminal inside the project directory and run these Git commands:

```bash
# 1. Stage the changed curriculum file
git add src/data/curriculum.ts

# 2. Commit the change with a message
git commit -m "feat: add DOM Basics module 8"

# 3. Push the updates to your repository
git push origin main
```

### Step 3: Automated Rebuilding
Once pushed, Vercel/Netlify will detect the commit, compile the React TS production bundles, and deploy the new lesson live within 30 seconds! The dashboard visual tree and certificate unlocking requirements will automatically adapt to support the new module.
