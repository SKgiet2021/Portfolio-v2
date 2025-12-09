# Portfolio-v2 - Complete Frontend Architecture

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + CSS Variables
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Geist Sans + Geist Mono (next/font)

## Theme: "Liquid Glass" / Dark Glassmorphism

- Dark mode default (`#0f172a` background)
- Glassmorphism panels with `backdrop-blur`
- Blue/purple accent fringes
- Interactive hover effects with cursor tracking

---

## Project Structure

```
app/
├── page.tsx          # Main homepage (hero, projects, sections)
├── layout.tsx        # Root layout with fonts, metadata
├── globals.css       # CSS variables, theme colors
├── (admin)/          # Admin panel (protected)
└── api/chat/         # RAG chatbot API

components/
├── ui/               # Reusable UI components
│   ├── digital-rain.tsx      # Animated dot grid background
│   ├── gooey-text-morphing.tsx # Morphing text effect
│   ├── evervault-card.tsx    # Matrix pattern cards
│   ├── glowing-effect.tsx    # Cursor-following glow
│   ├── tubelight-navbar.tsx  # Animated navbar
│   ├── animated-theme-toggler.tsx # Dark/light toggle
│   └── ai-input.tsx          # Chatbot trigger button
├── sections/         # Page sections
│   ├── AboutSection.tsx
│   ├── SkillsSection.tsx
│   ├── ContactSection.tsx
│   └── Certifications.tsx
└── chat/             # Chatbot widget
    ├── ChatWidget.tsx
    ├── ChatMessages.tsx
    ├── MessageBubble.tsx
    └── TypingIndicator.tsx
```

---

## Key Components

### 1. Digital Rain Background (digital-rain.tsx)

Canvas-based animated dot grid with ripple effects. Uses `requestAnimationFrame` for 60fps animation.

```tsx
<DigitalRainCanvas hue={160} /> // Cyan-ish color
```

### 2. Hero Section (page.tsx)

Uses GooeyText for morphing words: "beautiful", "smart", "new", "amazing".

### 3. Project Cards (SimpleGridItem)

- Evervault matrix pattern on hover
- GlowingEffect border follows cursor
- Grid layout with CSS grid-area

### 4. Navbar (tubelight-navbar.tsx)

- Fixed position, glassmorphism background
- Animated active indicator (tubelight effect)
- Scroll-spy for section detection

### 5. Theme Toggle (animated-theme-toggler.tsx)

- Uses View Transitions API for smooth animation
- Clip-path transition from toggle button
- Persists to localStorage

---

## Color System (globals.css)

### Light Mode

```css
--background: 0 0% 100%; /* white */
--foreground: 240 10% 3.9%; /* near-black */
--primary: 240 5.9% 10%; /* dark gray */
--muted: 240 4.8% 95.9%; /* light gray */
```

### Dark Mode

```css
--background: 240 10% 3.9%; /* #0f172a slate */
--foreground: 0 0% 98%; /* near-white */
--primary: 0 0% 98%; /* white */
--muted: 240 3.7% 15.9%; /* dark gray */
```

### Glass Variables

```css
--glass-bg: rgba(8, 11, 20, 0.3);
--glass-border: rgba(255, 255, 255, 0.12);
--glass-shadow: 0 28px 65px rgba(0, 0, 0, 0.78);
```

---

## Animation Patterns

### Framer Motion Usage

```tsx
// Entry animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
/>

// Hover effect
<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} />
```

### Canvas Animations

- DigitalRainCanvas: Dot grid with expanding ripples
- Uses refs to avoid re-renders during animation loop

---

## Chatbot Integration

- Floating button bottom-right
- Glassmorphism chat window
- Streaming responses from `/api/chat`
- LocalStorage for message history

---

## How to Modify

### Change Colors

Edit `globals.css` CSS variables

### Add New Section

1. Create `components/sections/NewSection.tsx`
2. Import in `app/page.tsx`
3. Add to main content

### Modify Animations

- Framer Motion: Change `initial`, `animate`, `transition` props
- Canvas: Edit `digital-rain.tsx` animation loop

### Change Fonts

Edit `app/layout.tsx` - uses next/font/google
