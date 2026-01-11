<div align="center">

# ✨ Portfolio v2 — Liquid Glass Design System

[![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Google AI](https://img.shields.io/badge/Powered_by-Google_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

**A modern, glassmorphism-styled portfolio with AI-powered chat, 3D elements, and mesmerizing animations**

[🌐 Live Demo](https://ethernetforge.xyz) • [📖 Documentation](#-features) • [🐛 Report Bug](https://github.com/SKgiet2021/Portfolio-v2/issues)

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="-----------------------------------------------------" width="100%">

</div>

## 🎨 Design Philosophy

> **"Liquid Glass"** — Dark glassmorphism meets fluid animations

This portfolio embodies a cutting-edge design language featuring:

- 🌊 **Fluid Animations** — Smooth 60fps canvas-based effects
- 🔮 **Glassmorphism** — Translucent panels with backdrop blur
- ✨ **Interactive Glow** — Cursor-tracking border effects
- 🌙 **Dark Mode First** — Optimized for low-light viewing

---

## ⚡ Tech Stack

<div align="center">

### 🎭 Frontend Core

![Next.js](https://img.shields.io/badge/-Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/-React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/-Tailwind_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

### 🎬 Animation & 3D

![Framer Motion](https://img.shields.io/badge/-Framer_Motion-FF0055?style=flat-square&logo=framer&logoColor=white)
![Three.js](https://img.shields.io/badge/-Three.js-000000?style=flat-square&logo=three.js&logoColor=white)
![React Three Fiber](https://img.shields.io/badge/-R3F-000000?style=flat-square&logo=three.js&logoColor=white)

### 🤖 AI Integration

![Google AI](https://img.shields.io/badge/-Google_Gemini-4285F4?style=flat-square&logo=google&logoColor=white)
![Streaming](https://img.shields.io/badge/-SSE_Streaming-009688?style=flat-square&logo=openai&logoColor=white)

### 🛠️ Developer Tools

![ESLint](https://img.shields.io/badge/-ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white)
![Vercel](https://img.shields.io/badge/-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![pnpm](https://img.shields.io/badge/-pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎭 **Visual Effects**

- ⚡ Digital Rain Canvas Background
- 🌈 Gooey Text Morphing Animations
- 🔮 Evervault Matrix Card Effects
- ✨ Cursor-Following Glow Borders
- 🌊 Fluid Blob Backgrounds
- 🎚️ Smooth Scroll Velocity Text

</td>
<td width="50%">

### 🛠️ **UI Components**

- 🧭 Tubelight Animated Navbar
- 🌓 Animated Theme Toggle (View Transitions API)
- 📱 Glassmorphism Contact Form
- 🏆 Achievement Cards
- ☁️ Interactive 3D Icon Cloud
- 🎯 Performance Monitor

</td>
</tr>
<tr>
<td>

### 🤖 **AI Chatbot**

- 💬 Streaming Text Responses
- 🧠 RAG-Powered Context
- 💾 LocalStorage History
- 🎨 Glassmorphism UI
- ⚡ Real-time Typing Indicator

</td>
<td>

### 📄 **Sections**

- 🏠 Hero with Morphing Text
- 👤 About Section
- 💼 Skills Showcase
- 🏗️ Project Grid
- 📜 Certifications Display
- 📧 Contact Form

</td>
</tr>
</table>

---

## 📁 Project Structure

```
portfolio-v2/
├── 📁 app/                    # Next.js App Router
│   ├── 📄 page.tsx            # Main homepage
│   ├── 📄 layout.tsx          # Root layout + fonts
│   ├── 📄 globals.css         # Theme variables
│   ├── 📁 api/chat/           # AI chatbot endpoint
│   ├── 📁 project/            # Project detail pages
│   └── 📁 (admin)/            # Protected admin panel
├── 📁 components/
│   ├── 📁 ui/                 # 26 reusable components
│   │   ├── digital-rain.tsx   # Canvas background
│   │   ├── gooey-text-morphing.tsx
│   │   ├── evervault-card.tsx
│   │   ├── glowing-effect.tsx
│   │   ├── smooth-cursor.tsx
│   │   └── ...more
│   ├── 📁 sections/           # Page sections
│   └── 📁 chat/               # Chatbot components
├── 📁 data/                   # JSON data files
├── 📁 hooks/                  # Custom React hooks
├── 📁 lib/                    # Utilities
└── 📁 public/                 # Static assets
```

---

## 🚀 Quick Start

### Prerequisites

![Node.js](https://img.shields.io/badge/Node.js->=18.0.0-339933?style=flat-square&logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm->=8.0.0-F69220?style=flat-square&logo=pnpm&logoColor=white)

### Installation

```bash
# 📦 Clone repository
git clone https://github.com/SKgiet2021/Portfolio-v2.git
cd Portfolio-v2

# 📥 Install dependencies
pnpm install

# ⚙️ Set up environment variables
cp .env.example .env.local
# Add your GOOGLE_GENAI_API_KEY

# 🚀 Start development server
pnpm dev

# 🏗️ Build for production
pnpm build

# 🌐 Start production server
pnpm start
```

---

## 🔐 Environment Variables

| Variable               | Description                       | Required |
| ---------------------- | --------------------------------- | -------- |
| `GOOGLE_GENAI_API_KEY` | Google Gemini API key for AI chat | ✅ Yes   |

> ⚠️ **Security Note:** Never commit `.env.local` to version control. The `.gitignore` is configured to exclude all `.env*` files.

---

## 🎨 Color System

### Dark Mode (Default)

```css
--background: #0f172a    /* Slate dark */
--foreground: #fafafa    /* Near white */
--primary: #fafafa       /* White accent */
--glass-bg: rgba(8, 11, 20, 0.3)
--glass-border: rgba(255, 255, 255, 0.12)
```

### Light Mode

```css
--background: #ffffff    /* Pure white */
--foreground: #0f172a    /* Slate dark */
--primary: #0f172a       /* Dark accent */
```

---

## 🌟 Key Components

### 1️⃣ Digital Rain Background

Canvas-based animated dot grid with ripple effects. GPU-accelerated for 60fps performance.

### 2️⃣ Gooey Text Morphing

SVG filter-based text animation with smooth character transitions.

### 3️⃣ Evervault Card

Matrix pattern overlay that follows mouse movement with gradient masking.

### 4️⃣ Smooth Cursor

Custom animated cursor with trailing effect and interactive states.

### 5️⃣ AI Chat Widget

Floating chatbot with streaming responses, glassmorphism design, and RAG integration.

---

## 📜 Available Scripts

| Command      | Description                 |
| ------------ | --------------------------- |
| `pnpm dev`   | 🚀 Start development server |
| `pnpm build` | 🏗️ Build for production     |
| `pnpm start` | 🌐 Start production server  |
| `pnpm lint`  | 🔍 Run ESLint               |

---

## 🔒 Security Features

- ✅ Environment variables excluded from git
- ✅ API keys server-side only (never exposed to client)
- ✅ Cloudflare protection enabled
- ✅ No sensitive data in client bundles
- ✅ Rate limiting on API endpoints

---

## 📱 Performance

- ⚡ Core Web Vitals optimized
- 🖼️ Lazy-loaded images and components
- 📦 Tree-shaken bundle
- 🗜️ Gzip/Brotli compression
- ⏱️ <3s First Contentful Paint

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. 🍴 Fork the project
2. 🌿 Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. ✏️ Commit changes (`git commit -m 'Add AmazingFeature'`)
4. 📤 Push to branch (`git push origin feature/AmazingFeature`)
5. 🎉 Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Swadhin Kumar**

[![GitHub](https://img.shields.io/badge/GitHub-SKgiet2021-181717?style=for-the-badge&logo=github)](https://github.com/SKgiet2021)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/swadhin-kumar-400aa71a0)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-FF5722?style=for-the-badge&logo=google-chrome&logoColor=white)](https://ethernetforge.xyz)

---

<div align="center">

### ⭐ Star this repo if you found it helpful!

[![GitHub stars](https://img.shields.io/github/stars/SKgiet2021/Portfolio-v2?style=social)](https://github.com/SKgiet2021/Portfolio-v2/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/SKgiet2021/Portfolio-v2?style=social)](https://github.com/SKgiet2021/Portfolio-v2/network/members)
[![GitHub watchers](https://img.shields.io/github/watchers/SKgiet2021/Portfolio-v2?style=social)](https://github.com/SKgiet2021/Portfolio-v2/watchers)

**Made with 💜 and lots of ☕**

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="-----------------------------------------------------" width="100%">

</div>
