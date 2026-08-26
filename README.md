# Archie

Archie is an intelligent, AI-powered system architecture diagram generator and refinement tool. Built with Next.js, React Flow, and Google's Gemini models, it transforms natural language prompts into scalable, visually stunning, and interactive software architectures.

## ✨ Unique Features

- **Natural Language to Architecture:** Simply describe what you want to build (e.g., "Design a microservices backend for an e-commerce app"), and Archie's AI engine instantly generates a complete, connected system architecture.
- **Smart Architecture Scoring:** Every generated design receives an AI-evaluated score (0-100) assessing its quality, scalability, and robustness. The evaluation includes detailed reasoning, key strengths, weaknesses, and architectural trade-offs.
- **Bottleneck & Risk Identification:** Archie automatically detects and flags Single Points of Failure (SPOFs), severe throughput bottlenecks, and rate-limiting vulnerabilities within specific nodes.
- **Context-Aware Refinement:** Focus on any individual component on the canvas and provide follow-up instructions (e.g., "Add a Redis caching layer here"). The AI will intelligently modify the existing architecture while maintaining the stability of unaffected components.
- **Interactive Visual Canvas:** Built on top of React Flow, featuring smooth animations, drag-and-drop node creation, auto-layout algorithms (powered by Dagre), zooming controls, and a MiniMap.
- **Categorized Nodes:** System components are visually categorized into distinct domains (`frontend`, `backend`, `database`, `ai`, and `infrastructure`) for immediate readability.

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI & Styling:** Tailwind CSS v4, Lucide React
- **Diagramming:** React Flow (`@xyflow/react`), Dagre for auto-layout
- **AI Integration:** Google Gemini (`@ai-sdk/google`), Vercel AI SDK
- **State Management:** Zustand
- **Database & Auth:** Supabase
- **Validation:** Zod

## 🚀 Getting Started

First, ensure you have your environment variables set up, particularly your Google Gemini API key and Supabase credentials in `.env.local`:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then, install the dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to start designing architectures!

## 🧠 How it Works

1. **Prompt:** Enter your system requirements in the Command Bar.
2. **AI Generation:** The backend uses `gemini-3.6-flash` and strict Zod schemas to guarantee a structured JSON response containing nodes (with categories, icons, bottleneck risks) and logical edges (synchronous or dynamic flows).
3. **Rendering:** Zustand manages the state while React Flow handles rendering the nodes. Dagre automatically calculates the most optimal layout for the generated graph.
4. **Refinement:** Select any node and issue an edit command. The AI understands the context of the focused node and modifies the JSON graph accordingly.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
