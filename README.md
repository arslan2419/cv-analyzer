# 🎯 ResumeAI - AI-Powered Resume Analyzer

<div align="center">

![ResumeAI Banner](https://img.shields.io/badge/ResumeAI-AI%20Resume%20Analyzer-6366f1?style=for-the-badge&logo=openai&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini%201.5-4285F4?style=flat-square&logo=google)](https://aistudio.google.com/)

**Analyze, optimize, and improve your resume with AI-powered insights**

[Live Demo](https://resume-ai-analyzer.vercel.app) · [Report Bug](https://github.com/yourusername/cv-analyzer/issues) · [Request Feature](https://github.com/yourusername/cv-analyzer/issues)

</div>

---

## ✨ Features

### Core Features

- **📄 Resume Parsing** - Upload PDF or DOCX files with automatic data extraction
- **🎯 Job Description Analysis** - Paste or upload JD for AI-powered requirement extraction
- **📊 Match Scoring** - Get detailed compatibility scores between resume and job
- **🤖 ATS Compatibility** - Check format issues, keyword density, and structure
- **✨ AI Improvements** - Generate enhanced resume sections with tone customization
- **🔑 Keyword Optimization** - Identify missing keywords and placement suggestions
- **📈 Visual Dashboard** - Beautiful charts and progress indicators
- **💾 Version History** - Save and compare resume versions locally

### Advanced Features

- **🎤 Interview Prep** - AI-generated questions based on your resume and job
- **📊 Career Insights** - Market demand analysis and skill gap identification
- **🎭 Tone Selection** - Professional, Technical, Leadership, or Confident styles
- **🏢 Role Presets** - Pre-configured analysis for 10+ job categories
- **🔒 Privacy First** - No data storage, session-only processing

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API Key - **FREE!** ([Get one here](https://aistudio.google.com/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cv-analyzer.git
   cd cv-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Gemini API key (FREE):
   ```env
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
cv-analyzer/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── parse-resume/  # Resume parsing endpoint
│   │   │   ├── parse-jd/      # JD parsing endpoint
│   │   │   ├── analyze/       # Analysis endpoint
│   │   │   ├── improve/       # Improvement generation
│   │   │   ├── interview-prep/# Interview questions
│   │   │   └── career-insights/# Career analysis
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page
│   │
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── ScoreCircle.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── Steps.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── ...
│   │   │
│   │   └── features/          # Feature components
│   │       ├── ResumeUpload.tsx
│   │       ├── JobDescriptionInput.tsx
│   │       ├── AnalysisDashboard.tsx
│   │       ├── ResumeImprovement.tsx
│   │       ├── FinalSummary.tsx
│   │       ├── InterviewPrep.tsx
│   │       └── CareerInsights.tsx
│   │
│   ├── lib/
│   │   ├── ai/                # AI integration
│   │   │   ├── analyzer.ts    # OpenAI analysis functions
│   │   │   └── prompts.ts     # AI prompts
│   │   ├── parsers/           # Document parsers
│   │   │   ├── resume-parser.ts
│   │   │   └── jd-parser.ts
│   │   ├── store.ts           # Zustand state management
│   │   ├── utils.ts           # Utility functions
│   │   └── presets.ts         # Role presets
│   │
│   └── types/
│       └── index.ts           # TypeScript type definitions
│
├── public/                    # Static assets
├── .env.example              # Environment template
├── tailwind.config.ts        # Tailwind configuration
├── next.config.mjs           # Next.js configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.4 |
| **Styling** | Tailwind CSS 3.4 |
| **State** | Zustand |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **AI** | Google Gemini 1.5 Flash (FREE) |
| **PDF Parsing** | pdf-parse |
| **DOCX Parsing** | mammoth |
| **File Upload** | react-dropzone |

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key (FREE at https://aistudio.google.com/apikey) |
| `DATABASE_URL` | No | Database connection (for persistence) |
| `NEXTAUTH_SECRET` | No | Auth secret (for authentication) |

### Role Presets

The application includes pre-configured analysis settings for:

- Frontend Developer
- Backend Developer
- Full Stack Developer
- Data Analyst
- Data Scientist
- Product Manager
- DevOps Engineer
- UI/UX Designer
- Mobile Developer
- QA Engineer

---

## 📊 API Endpoints

### POST `/api/parse-resume`
Parses uploaded resume file (PDF/DOCX)

**Request:** `multipart/form-data`
- `file`: Resume file
- `useAI`: `"true"` for AI-enhanced extraction

**Response:**
```json
{
  "success": true,
  "data": {
    "contact": { "name": "...", "email": "...", ... },
    "skills": ["React", "TypeScript", ...],
    "experience": [...],
    "education": [...],
    ...
  }
}
```

### POST `/api/parse-jd`
Parses job description text or PDF

### POST `/api/analyze`
Analyzes resume against job description

### POST `/api/improve`
Generates AI-powered improvements

### POST `/api/interview-prep`
Generates interview questions

### POST `/api/career-insights`
Generates career insights and recommendations

---

## 🎨 UI Components

### Core Components

- **Button** - Multiple variants (primary, secondary, ghost, danger)
- **Card** - Container with variants (default, elevated, glass, gradient)
- **ScoreCircle** - Animated circular progress indicator
- **ProgressBar** - Linear progress with gradient support
- **FileUpload** - Drag & drop file upload zone
- **Steps** - Horizontal/vertical step indicator
- **Tabs** - Animated tab system
- **Badge** - Status indicators
- **Select** - Custom dropdown select
- **Tooltip** - Hover tooltips

All components are built with:
- Full TypeScript support
- Framer Motion animations
- Dark theme optimization
- Responsive design

---

## 🔒 Privacy & Security

- **No Data Storage** - Resumes and JDs are processed in-memory only
- **Session-Only** - All data is cleared when you close the browser
- **Secure API Calls** - OpenAI API calls are made server-side
- **No Third-Party Sharing** - Your data is never shared
- **Optional Persistence** - Opt-in local storage for history

---

## 🚢 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/cv-analyzer)

1. Click the button above
2. Add your `GEMINI_API_KEY` environment variable (get free key at https://aistudio.google.com/apikey)
3. Deploy!

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Google Gemini](https://aistudio.google.com/) for the powerful FREE Gemini API
- [Vercel](https://vercel.com/) for hosting and Next.js
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) for animations

---

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - your.email@example.com

Project Link: [https://github.com/yourusername/cv-analyzer](https://github.com/yourusername/cv-analyzer)

---

<div align="center">

**Built with ❤️ for job seekers everywhere**

⭐ Star this repo if you find it helpful!

</div>
