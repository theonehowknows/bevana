import {
  AestheticPreset,
  Blueprint,
  ConstraintItem,
  DataTemplatePreset,
  ReferencePreset,
  StageGuide,
  StarterScenario,
} from '../types/blueprint';

export const BORROWABLE_ASPECTS = [
  'Step-by-step flow',
  'Page layout',
  'Look & feel',
  'Search & filters',
  'Keyboard shortcuts',
  'Score & progress',
];

export const STAGE_GUIDES: StageGuide[] = [
  {
    stage: 1,
    shortTitle: '1. Idea & Inspo',
    title: 'Step 1: Your App Idea & Inspiration',
    whatItDoes:
      'Give your project a name, explain what it does in 1–2 everyday sentences, and optionally pick a website, app, or game to take inspiration from.',
    whyItMatters:
      'Starting with a clear goal and a real-world example helps AI build the right layout on the first try instead of guessing.',
    quickTip:
      'Not sure where to start? Pick one of the Starter Ideas below—you can edit every word afterward.',
  },
  {
    stage: 2,
    shortTitle: '2. Setup & Screens',
    title: 'Step 2: App Setup & Target Screens',
    whatItDoes:
      'Choose what kind of web app you are building, which icon style to use, and which screens (laptop, phone, or both) it should fit best.',
    whyItMatters:
      'Locking in the setup upfront prevents broken code or messy layouts when you paste the prompt into Google AI Studio.',
    quickTip:
      'For most personal tools and prototypes, "Single-page React app" and "Works on phones and laptops" is the safest starting point.',
  },
  {
    stage: 3,
    shortTitle: '3. Look & Feel',
    title: 'Step 3: Visual Design & Vibe',
    whatItDoes:
      'Pick a color mood, layout style, spacing comfort, and text feel—no design background needed.',
    whyItMatters:
      'Clear visual rules stop your app from looking generic or cluttered and let you generate a separate Design Prompt too.',
    quickTip:
      'Pick a mood card by how it looks, then tweak the layout and spacing buttons to match your taste.',
  },
  {
    stage: 4,
    shortTitle: '4. Saved Info',
    title: 'Step 4: What Info Your App Saves',
    whatItDoes:
      'Describe the main items your app keeps track of (like tasks, recipes, or game scores) and where they are stored.',
    whyItMatters:
      'Showing an example of one saved item ensures your input forms, filters, and summary cards all match each other.',
    quickTip:
      'Click a Data Starter below or use the simple Field Builder—you never have to write JSON by hand.',
  },
  {
    stage: 5,
    shortTitle: '5. Features & Rules',
    title: 'Step 5: Feature Checklist & Guardrails',
    whatItDoes:
      'Build a simple checklist of features you want included, plus plain-English rules for what the AI should keep simple or avoid.',
    whyItMatters:
      'A short checklist keeps the build focused and prevents half-finished code, login walls, or unnecessary complexity.',
    quickTip:
      'Aim for 3 to 6 core features for version 1. You can always add more after you see your first working version.',
  },
];

export const STARTER_SCENARIOS: StarterScenario[] = [
  {
    id: 'habit-tracker',
    title: 'Daily Habit Tracker',
    subtitle: 'Check off daily routines and see your streak',
    appName: 'Daily Cadence',
    summary:
      'A calm daily habit tracker where users add routines, check them off each day, filter by category, and view a weekly completion summary.',
    referenceType: 'app',
    targetName: 'Notion',
    coreLoop:
      'Add a habit -> check it off for today -> filter by morning/evening -> view weekly consistency.',
    layoutPattern: 'Top input bar + filter tabs + clean checklist with a compact summary card.',
    differentiator: 'No accounts or reminders spam—just fast one-click daily check-ins saved in the browser.',
    primaryEntities: 'Habit { id, name, category, completedToday, streakDays }',
    schemaPreview: `{
  "id": "hab_01",
  "name": "20-minute morning walk",
  "category": "Health",
  "completedToday": true,
  "streakDays": 6
}`,
    features: [
      'Primary input bar to add a new habit',
      'Real-time filter controls (All / Morning / Evening / Health)',
      'Summary dashboard card showing today’s completion count',
      'One-click check-off with streak counter',
    ],
  },
  {
    id: 'meal-planner',
    title: 'Meal & Recipe Planner',
    subtitle: 'Save favorite meals and plan your week',
    appName: 'Pantry Week',
    summary:
      'A simple meal and recipe planner for saving go-to dishes, filtering by cooking time or diet, and assigning meals to days of the week.',
    referenceType: 'website',
    targetName: 'Are.na',
    coreLoop:
      'Save a recipe with prep time -> filter by quick meals -> assign to a weekday -> generate a quick grocery summary.',
    layoutPattern: 'Search and add bar at top, 3-column recipe cards below, and a clean weekly summary panel.',
    differentiator: 'Focused on personal go-to meals instead of bloated social feeds or ads.',
    primaryEntities: 'Recipe { id, title, prepMinutes, tag, plannedDay }',
    schemaPreview: `{
  "id": "rec_01",
  "title": "Roasted Garlic Pasta",
  "prepMinutes": 20,
  "tag": "Quick Dinner",
  "plannedDay": "Tuesday"
}`,
    features: [
      'Primary input bar to add recipes and prep time',
      'Real-time filter controls by meal tag and search',
      'Summary dashboard card showing planned meals this week',
      'Day-of-week selector on each recipe card',
    ],
  },
  {
    id: 'link-shelf',
    title: 'Bookmark & Link Collector',
    subtitle: 'Organize articles, tools, and inspiration',
    appName: 'LinkShelf',
    summary:
      'A tidy personal bookmark organizer for saving useful websites, tagging them by topic, and searching them instantly without browser clutter.',
    referenceType: 'website',
    targetName: 'Are.na',
    coreLoop:
      'Paste a link and short note -> pick a topic tag -> filter or search anytime -> copy or open in one click.',
    layoutPattern: 'Quick-save bar on top, topic tabs underneath, and a clean grid of saved link cards.',
    differentiator: '100% private in browser localStorage with zero accounts or tracking.',
    primaryEntities: 'SavedLink { id, title, url, topic, note, savedAt }',
    schemaPreview: `{
  "id": "lnk_01",
  "title": "Color Contrast Checker",
  "url": "https://example.com/contrast",
  "topic": "Design",
  "note": "Great for checking button text legibility"
}`,
    features: [
      'Primary input bar for URL, title, and topic',
      'Real-time filter controls by topic and keyword search',
      'Summary dashboard card with saved link totals',
      'One-click copy link and delete controls',
    ],
  },
  {
    id: 'flashcard-study',
    title: 'Study Flashcard Deck',
    subtitle: 'Practice questions and track what you know',
    appName: 'Recall Deck',
    summary:
      'A distraction-free flashcard study app where learners create decks, flip cards to test themselves, and track mastered vs. review-again cards.',
    referenceType: 'app',
    targetName: 'Duolingo',
    coreLoop:
      'Add question & answer cards -> start practice mode -> flip card -> mark Got It or Review Again -> view progress.',
    layoutPattern: 'Centered focus card stage with flip button, paired with a quick card-manager list.',
    differentiator: 'Clean study-first screen with zero distracting popups or paywalls.',
    primaryEntities: 'Flashcard { id, deck, question, answer, mastered }',
    schemaPreview: `{
  "id": "card_01",
  "deck": "Spanish Basics",
  "question": "How do you say 'Good morning'?",
  "answer": "Buenos días",
  "mastered": false
}`,
    features: [
      'Primary input bar to add new question & answer cards',
      'Interactive flip-card practice mode with Next / Previous',
      'Real-time filter controls (All / Needs Review / Mastered)',
      'Summary dashboard card showing mastery progress',
    ],
  },
  {
    id: 'daily-puzzle-game',
    title: 'Quick Daily Puzzle Game',
    subtitle: 'Short 3-minute brain teaser with score history',
    appName: 'Tile Match 5',
    summary:
      'A crisp, relaxing daily word or number puzzle game where players solve a 5-step challenge, get clear visual feedback, and track their best streaks.',
    referenceType: 'game',
    targetName: 'Wordle',
    coreLoop:
      'See today’s puzzle board -> make a move -> receive clear color/icon feedback -> win or retry -> view streak stats.',
    layoutPattern: 'Centered puzzle board with clear controls underneath and a compact stats modal/card.',
    differentiator: 'Playable immediately with clear rules and saved local streak history.',
    primaryEntities: 'GameSession { round, movesUsed, maxMoves, won, bestStreak }',
    schemaPreview: `{
  "round": 12,
  "movesUsed": 3,
  "maxMoves": 6,
  "won": true,
  "bestStreak": 5
}`,
    features: [
      'Interactive puzzle grid with clickable and keyboard input',
      'Clear win/loss feedback and New Round button',
      'Summary dashboard card tracking games played and win streak',
      'Beginner-friendly How to Play panel',
    ],
  },
];

export const LAYOUT_CHOICES = [
  'Single centered column (easiest to scan)',
  'Top bar + 3-column card grid (great for collections)',
  'Split view: controls on left, live preview on right',
  'Sidebar navigation + main workspace panel',
];

export const DENSITY_CHOICES = [
  'Spacious & calm (lots of breathing room)',
  'Balanced everyday layout',
  'Compact & information-rich',
];

export const AESTHETIC_PRESETS: AestheticPreset[] = [
  {
    id: 'swiss-minimalist',
    name: 'Dark & Calm',
    plainLabel: 'Swiss Minimalist',
    description: 'Deep charcoal background, clean card borders, and subtle violet highlights.',
    style: 'Swiss Minimalist',
    background: 'bg-zinc-950 (with light mode bg-zinc-50 support)',
    cardSurfaces: 'bg-zinc-900 with border border-zinc-800 rounded-xl',
    typography: 'Plus Jakarta Sans headings, DM Sans body, JetBrains Mono for code/numbers',
    accent: 'Violet-500 for active states and primary buttons',
    motion: 'Subtle transitions (transition-all duration-150 ease-out)',
    swatchBg: '#09090b',
    swatchCard: '#18181b',
    swatchAccent: '#8b5cf6',
    swatchText: '#f4f4f5',
    antiPatterns: [
      'Avoid decorative pill badges on static labels',
      'Avoid thick left accent bars (border-l-4) or nested boxes inside boxes',
      'Avoid fake status indicators or made-up scores',
    ],
  },
  {
    id: 'clean-daylight',
    name: 'Crisp Daylight',
    plainLabel: 'Clean Light Studio',
    description: 'Bright off-white canvas, crisp paper-white cards, and clear slate text.',
    style: 'Clean Light Studio',
    background: 'bg-zinc-50 (with dark mode bg-zinc-950 support)',
    cardSurfaces: 'bg-white with border border-zinc-200 rounded-xl',
    typography: 'Plus Jakarta Sans headings, DM Sans body, high-contrast dark ink',
    accent: 'Violet-600 for primary buttons and active tabs',
    motion: 'Subtle transitions (transition-all duration-150 ease-out)',
    swatchBg: '#fafafa',
    swatchCard: '#ffffff',
    swatchAccent: '#7c3aed',
    swatchText: '#18181b',
    antiPatterns: [
      'Avoid faint gray text that is hard to read on white backgrounds',
      'Avoid heavy drop shadows on every card',
      'Keep primary action buttons obvious and high-contrast',
    ],
  },
  {
    id: 'editorial-paper',
    name: 'Warm Paper',
    plainLabel: 'Editorial Studio',
    description: 'Warm stone surfaces with generous reading space and amber highlights.',
    style: 'Editorial Studio',
    background: 'bg-stone-950 (or warm stone-50 in light mode)',
    cardSurfaces: 'bg-stone-900 with border border-stone-800 rounded-xl',
    typography: 'Fraunces or Playfair Display headlines paired with DM Sans readable text',
    accent: 'Amber-500 for curated highlights and primary buttons',
    motion: 'Calm 180ms ease-out transitions',
    swatchBg: '#0c0a09',
    swatchCard: '#1c1917',
    swatchAccent: '#f59e0b',
    swatchText: '#f5f5f4',
    antiPatterns: [
      'Avoid crowded multi-column clutter on reading areas',
      'Avoid giant faded background watermark text',
      'Keep paragraphs at a comfortable reading width',
    ],
  },
  {
    id: 'dark-terminal',
    name: 'Retro Console',
    plainLabel: 'Dark Terminal',
    description: 'Focused dark charcoal workspace with crisp monospace numbers and green accents.',
    style: 'Dark Terminal',
    background: 'bg-neutral-950',
    cardSurfaces: 'bg-neutral-900 with border border-neutral-800 rounded-lg',
    typography: 'JetBrains Mono for headings and numbers, DM Sans for plain explanations',
    accent: 'Emerald-500 for active focus and save actions',
    motion: 'Crisp 120ms opacity and hover transitions',
    swatchBg: '#0a0a0a',
    swatchCard: '#171717',
    swatchAccent: '#10b981',
    swatchText: '#e5e5e5',
    antiPatterns: [
      'Avoid fake hacker boot screens or made-up system logs',
      'Avoid harsh neon glow shadows',
      'Use plain everyday labels on buttons (Save, Reset, Filter)',
    ],
  },
  {
    id: 'tactile-arcade',
    name: 'Crisp Arcade',
    plainLabel: 'Tactile Arcade',
    description: 'Playful yet super readable game board cards with bright sky-blue selection states.',
    style: 'Tactile Arcade',
    background: 'bg-slate-950',
    cardSurfaces: 'bg-slate-900 with border border-slate-700/80 rounded-xl',
    typography: 'Outfit bold numbers, DM Sans card descriptions, JetBrains Mono counters',
    accent: 'Sky-500 for selected cards and play buttons',
    motion: 'Snappy 140ms card lift and click transitions',
    swatchBg: '#020617',
    swatchCard: '#0f172a',
    swatchAccent: '#0ea5e9',
    swatchText: '#f8fafc',
    antiPatterns: [
      'Avoid glossy plastic 3D shapes or distracting lens flares',
      'Make buttons and game rules readable without hovering',
      'Keep score counters tied to real game state',
    ],
  },
];

export const REFERENCE_PRESETS: ReferencePreset[] = [
  {
    id: 'linear-triage',
    name: 'Linear',
    referenceType: 'app',
    tagline: 'Fast, calm task list with clean priority filters',
    suggestedAppName: 'ScopeFlow',
    summary:
      'A fast, calm task and project organizer for capturing ideas, filtering priorities in real time, and tracking progress without clutter.',
    borrowedAspects: ['Page layout', 'Look & feel', 'Search & filters'],
    coreLoop:
      'Type a task in the top bar -> pick priority -> filter by status -> mark done on a clean summary card.',
    layoutPattern:
      'Clean top search/filter bar paired with a calm list of items and a compact progress summary.',
    differentiator:
      'Built for fast solo focus with zero team setup or complicated menus.',
    aestheticStyle: 'Swiss Minimalist',
    background: 'bg-zinc-950',
    cardSurfaces: 'bg-zinc-900 with border border-zinc-800 rounded-xl',
    typography: 'Plus Jakarta Sans headings, DM Sans body, JetBrains Mono tabular IDs',
    accent: 'Violet-500 for active states',
    motion: 'Subtle transitions (transition-all duration-150 ease-out)',
    primaryEntities: 'WorkItem { id, title, status, priority, category, createdAt }',
    schemaPreview: `{
  "id": "item_01",
  "title": "Finish project outline",
  "status": "active",
  "priority": "high",
  "category": "Product",
  "createdAt": "2026-11-14"
}`,
    features: [
      'Primary input bar with quick priority picker',
      'Real-time filter controls (All / Active / Completed + search)',
      'Summary dashboard card with completion counts',
      'One-click complete toggle and inline edit',
    ],
  },
  {
    id: 'trello-boards',
    name: 'Trello',
    referenceType: 'app',
    tagline: 'Visual columns for To Do, Doing, and Done',
    suggestedAppName: 'CardBoard Lite',
    summary:
      'A straightforward visual task board where users add cards, move them across To Do / In Progress / Done columns, and filter by label.',
    borrowedAspects: ['Page layout', 'Step-by-step flow', 'Search & filters'],
    coreLoop:
      'Add a card to To Do -> click to move to In Progress -> filter by tag -> mark Done.',
    layoutPattern:
      '3-column horizontal board on desktop (stacks cleanly on mobile) with a quick-add bar at the top.',
    differentiator:
      'Simple click-to-move buttons alongside drag-free clarity so it works easily on both mouse and touch.',
    aestheticStyle: 'Swiss Minimalist',
    background: 'bg-zinc-950',
    cardSurfaces: 'bg-zinc-900 with border border-zinc-800 rounded-xl',
    typography: 'Plus Jakarta Sans column titles, DM Sans card text',
    accent: 'Violet-500 for active filters and Add Card button',
    motion: 'Subtle transitions (transition-all duration-150 ease-out)',
    primaryEntities: 'BoardCard { id, title, column, tag, updatedAt }',
    schemaPreview: `{
  "id": "card_01",
  "title": "Design homepage hero",
  "column": "doing",
  "tag": "Design",
  "updatedAt": "2026-11-14"
}`,
    features: [
      'Primary input bar to add cards to any column',
      '3 status columns (To Do, In Progress, Done) with move buttons',
      'Real-time filter controls by tag and search text',
      'Summary dashboard card showing cards per column',
    ],
  },
  {
    id: 'notion-habit-os',
    name: 'Notion',
    referenceType: 'app',
    tagline: 'Clean personal pages and structured daily notes',
    suggestedAppName: 'Cadence Notes',
    summary:
      'A distraction-free personal planning app combining structured daily logs with instant filterable views.',
    borrowedAspects: ['Page layout', 'Search & filters', 'Step-by-step flow'],
    coreLoop:
      'Write a quick note or log -> pick a category -> filter past entries -> review weekly summary.',
    layoutPattern:
      'Clean single-column workspace centered nicely on screen with simple filter tabs on top.',
    differentiator:
      'Ready to use immediately without complicated database setup.',
    aestheticStyle: 'Swiss Minimalist',
    background: 'bg-zinc-950',
    cardSurfaces: 'bg-zinc-900 with border border-zinc-800 rounded-xl',
    typography: 'Plus Jakarta Sans headings, DM Sans body, JetBrains Mono dates',
    accent: 'Violet-500 for active view tabs',
    motion: 'Subtle transitions (transition-all duration-150 ease-out)',
    primaryEntities: 'JournalEntry { id, title, category, completed, date }',
    schemaPreview: `{
  "id": "entry_09",
  "title": "Shipped first version of app",
  "category": "Build",
  "completed": true,
  "date": "2026-11-14"
}`,
    features: [
      'Primary input bar for quick entry creation',
      'Real-time category filter controls and search',
      'Summary dashboard card for weekly counts',
      'Automatic browser saving with JSON export',
    ],
  },
  {
    id: 'spotify-queue',
    name: 'Spotify',
    referenceType: 'app',
    tagline: 'Curated playlists, search bar, and clean now-playing bar',
    suggestedAppName: 'Focus Sounds',
    summary:
      'A clean audio/playlist organizer where users collect ambient sound links or study tracks, filter by mood, and queue favorites.',
    borrowedAspects: ['Page layout', 'Search & filters', 'Look & feel'],
    coreLoop:
      'Pick a mood filter -> browse saved items -> add to active queue -> track session timer.',
    layoutPattern:
      'Left mood/collection list + main item grid + slim bottom active-item bar.',
    differentiator:
      'Calm, ad-free personal focus library stored locally without subscriptions.',
    aestheticStyle: 'Swiss Minimalist',
    background: 'bg-zinc-950',
    cardSurfaces: 'bg-zinc-900 with border border-zinc-800 rounded-xl',
    typography: 'Plus Jakarta Sans titles, DM Sans descriptions',
    accent: 'Violet-500 for active track and filter state',
    motion: 'Subtle transitions (transition-all duration-150 ease-out)',
    primaryEntities: 'PlaylistItem { id, title, mood, durationMinutes, favorite }',
    schemaPreview: `{
  "id": "snd_01",
  "title": "Rainy Coffee Shop Ambience",
  "mood": "Deep Focus",
  "durationMinutes": 45,
  "favorite": true
}`,
    features: [
      'Primary input bar to add custom sound or link items',
      'Real-time mood filter tabs and keyword search',
      'Favorites toggle and active queue bar',
      'Summary dashboard card showing total library items',
    ],
  },
  {
    id: 'stripe-docs-site',
    name: 'Stripe Docs',
    referenceType: 'website',
    tagline: 'Helpful guide on the left, live example on the right',
    suggestedAppName: 'SpecCraft Guide',
    summary:
      'An interactive guide website that pairs plain-English step explanations on the left with a live copyable output on the right.',
    borrowedAspects: ['Page layout', 'Look & feel', 'Step-by-step flow'],
    coreLoop:
      'Choose a step -> read the plain explanation -> fill in options -> copy the ready-to-use result.',
    layoutPattern:
      'Split-screen 50/50 layout: guided steps on the left, sticky live preview on the right.',
    differentiator:
      'Every input updates the right-hand output immediately instead of static examples.',
    aestheticStyle: 'Swiss Minimalist',
    background: 'bg-zinc-950',
    cardSurfaces: 'bg-zinc-900 with border border-zinc-800 rounded-xl',
    typography: 'Plus Jakarta Sans headings, DM Sans readable prose, JetBrains Mono output',
    accent: 'Violet-500 for active step and copy button',
    motion: 'Subtle transitions (transition-all duration-150 ease-out)',
    primaryEntities: 'SpecDocument { id, title, stageIndex, compiledOutput }',
    schemaPreview: `{
  "id": "spec_01",
  "title": "Beginner Prompt Guide",
  "stageIndex": 2,
  "storage": "localStorage"
}`,
    features: [
      'Split-pane step guide with live synchronized right pane',
      'Real-time filter controls for starter templates',
      'One-click copy and file download buttons',
      'Summary dashboard card showing step completion',
    ],
  },
  {
    id: 'arena-curation',
    name: 'Are.na',
    referenceType: 'website',
    tagline: 'Calm visual moodboard for links, colors, and notes',
    suggestedAppName: 'MoodShelf',
    summary:
      'A calm visual research board for collecting helpful websites, color notes, and ideas into clean filterable folders.',
    borrowedAspects: ['Look & feel', 'Search & filters', 'Page layout'],
    coreLoop:
      'Paste a link or note -> pick a folder -> filter calmly -> review or export.',
    layoutPattern:
      'Clean top capture bar + spacious 3-column card grid with quiet labels.',
    differentiator:
      'No likes, follower counts, or noisy feeds—just calm personal collecting.',
    aestheticStyle: 'Editorial Studio',
    background: 'bg-stone-950',
    cardSurfaces: 'bg-stone-900 with border border-stone-800 rounded-xl',
    typography: 'Plus Jakarta Sans titles, DM Sans notes, JetBrains Mono URLs',
    accent: 'Amber-500 for active folder selection',
    motion: 'Calm 180ms ease-out transitions',
    primaryEntities: 'ReferenceBlock { id, title, folder, url, note, savedAt }',
    schemaPreview: `{
  "id": "blk_104",
  "title": "Clean Layout Inspiration",
  "folder": "Layouts",
  "url": "https://example.com/layout",
  "savedAt": "2026-11-14"
}`,
    features: [
      'Primary input bar for quick URL, color, or note capture',
      'Real-time folder filter controls and search',
      'Summary dashboard card showing collection totals',
      'Click-to-edit detail view for saved items',
    ],
  },
  {
    id: 'wordle-daily',
    name: 'Wordle',
    referenceType: 'game',
    tagline: 'Simple daily puzzle with instant color feedback and streaks',
    suggestedAppName: 'Daily Clue',
    summary:
      'A friendly 5-minute daily puzzle game where players guess answers in limited tries, get clear visual clues, and track streaks.',
    borrowedAspects: ['Step-by-step flow', 'Score & progress', 'Look & feel'],
    coreLoop:
      'Enter guess -> see color-coded letter/tile hints -> adjust next guess -> win and save streak.',
    layoutPattern:
      'Centered puzzle grid + on-screen clickable keyboard + clean stats summary.',
    differentiator:
      'Playable anytime with unlimited practice mode plus clear beginner instructions.',
    aestheticStyle: 'Swiss Minimalist',
    background: 'bg-zinc-950',
    cardSurfaces: 'bg-zinc-900 with border border-zinc-800 rounded-xl',
    typography: 'Plus Jakarta Sans uppercase tiles, DM Sans rules, JetBrains Mono streak numbers',
    accent: 'Violet-500 for active selection and Play Again button',
    motion: 'Subtle 150ms tile flip and feedback transitions',
    primaryEntities: 'PuzzleState { round, guesses, maxGuesses, won, currentStreak }',
    schemaPreview: `{
  "round": 4,
  "guesses": ["CRANE", "PLANT"],
  "maxGuesses": 6,
  "won": false,
  "currentStreak": 3
}`,
    features: [
      'Centered interactive puzzle grid with keyboard and click support',
      'Clear color + symbol feedback for each guess',
      'Summary dashboard card showing win rate and streak',
      'Simple How to Play instructions toggle',
    ],
  },
  {
    id: 'balatro-synergy',
    name: 'Balatro',
    referenceType: 'game',
    tagline: 'Readable card combo game with clear score previews',
    suggestedAppName: 'Synergy Deck',
    summary:
      'A turn-based card-scoring web game where players pick cards, preview combo points before playing, and unlock fun modifiers between rounds.',
    borrowedAspects: ['Step-by-step flow', 'Score & progress', 'Look & feel'],
    coreLoop:
      'Draw cards -> select cards and preview score -> play hand -> buy a bonus modifier -> next round.',
    layoutPattern:
      'Left score/round panel + middle card play area + bottom Play & Discard buttons.',
    differentiator:
      'Shows the exact combo math clearly before you click Play so beginners understand every move.',
    aestheticStyle: 'Tactile Arcade',
    background: 'bg-slate-950',
    cardSurfaces: 'bg-slate-900 with border border-slate-700/80 rounded-xl',
    typography: 'Outfit bold numbers, DM Sans card descriptions, JetBrains Mono score counters',
    accent: 'Sky-500 for selected cards and Play button',
    motion: 'Snappy 140ms card lift transitions',
    primaryEntities: 'GameState { round, targetScore, currentScore, handsLeft, hand }',
    schemaPreview: `{
  "round": 2,
  "targetScore": 450,
  "currentScore": 180,
  "handsLeft": 3,
  "activeModifiers": ["Pair Boost +15"]
}`,
    features: [
      'Interactive hand of cards with clear selection lift',
      'Live score & combo preview before playing a hand',
      'Round progress summary card with target bar',
      'Between-round bonus shop saved locally',
    ],
  },
  {
    id: 'mini-metro-puzzle',
    name: 'Mini Metro',
    referenceType: 'game',
    tagline: 'Clean map-connecting puzzle with pause and speed controls',
    suggestedAppName: 'LineCraft',
    summary:
      'A minimalist route-connecting puzzle game where players link growing stations with colored lines before stations get too crowded.',
    borrowedAspects: ['Step-by-step flow', 'Look & feel', 'Score & progress'],
    coreLoop:
      'Spot new stations -> draw clean connecting lines -> manage crowding -> unlock extra lines each week.',
    layoutPattern:
      'Clean central map canvas with compact score counter at top and line color buttons at bottom.',
    differentiator:
      'Relaxing pacing with a Pause button so new players never feel rushed.',
    aestheticStyle: 'Swiss Minimalist',
    background: 'bg-zinc-950',
    cardSurfaces: 'bg-zinc-900 with border border-zinc-800 rounded-xl',
    typography: 'Plus Jakarta Sans HUD labels, JetBrains Mono score & timer',
    accent: 'Violet-500 for active line tool',
    motion: 'Smooth 150ms line drawing and pause/play transitions',
    primaryEntities: 'NetworkState { stations, lines, score, week, speedMultiplier }',
    schemaPreview: `{
  "week": 3,
  "passengersDelivered": 142,
  "activeLines": 3,
  "speedMultiplier": 1
}`,
    features: [
      'Interactive canvas for connecting nodes with lines',
      'Play, Pause, and 2x speed buttons',
      'Live score and station load indicators',
      'Best score history saved in localStorage',
    ],
  },
];

export const DATA_TEMPLATES: DataTemplatePreset[] = [
  {
    id: 'tasks',
    label: 'Tasks / To-Dos',
    description: 'Title, category, priority, and done checkbox',
    primaryEntities: 'TaskItem { id, title, category, priority, done, createdAt }',
    schemaPreview: `{
  "id": "task_01",
  "title": "Review project outline",
  "category": "Work",
  "priority": "high",
  "done": false,
  "createdAt": "2026-11-14"
}`,
  },
  {
    id: 'notes',
    label: 'Notes / Bookmarks',
    description: 'Title, folder/tag, link or note text, date',
    primaryEntities: 'SavedItem { id, title, folder, url, notes, savedAt }',
    schemaPreview: `{
  "id": "note_01",
  "title": "Design inspiration link",
  "folder": "Ideas",
  "url": "https://example.com",
  "notes": "Clean spacing and dark card contrast",
  "savedAt": "2026-11-14"
}`,
  },
  {
    id: 'habits',
    label: 'Habits / Daily Log',
    description: 'Routine name, frequency, streak, checked today',
    primaryEntities: 'HabitLog { id, name, timeOfDay, streak, completedToday }',
    schemaPreview: `{
  "id": "hab_01",
  "name": "Read 15 pages",
  "timeOfDay": "Evening",
  "streak": 4,
  "completedToday": true
}`,
  },
  {
    id: 'budget',
    label: 'Expenses / Budget',
    description: 'Description, amount, category, date',
    primaryEntities: 'Expense { id, label, amount, category, date }',
    schemaPreview: `{
  "id": "exp_01",
  "label": "Coffee & Pastry",
  "amount": 6.5,
  "category": "Food",
  "date": "2026-11-14"
}`,
  },
  {
    id: 'game',
    label: 'Game Score & Round',
    description: 'Round number, score, moves left, best streak',
    primaryEntities: 'GameState { round, score, movesLeft, status, bestScore }',
    schemaPreview: `{
  "round": 1,
  "score": 120,
  "movesLeft": 4,
  "status": "playing",
  "bestScore": 480
}`,
  },
];

export const QUICK_FEATURE_IDEAS = [
  'Primary input bar to add items quickly',
  'Real-time filter controls and search box',
  'Summary dashboard card with totals',
  'Light & dark mode toggle',
  'One-click edit and delete confirmation',
  'Export / download saved items as a file',
  'Beginner-friendly empty state with starter button',
  'Keyboard shortcut support (Enter to add)',
];

export const DEFAULT_CONSTRAINTS: ConstraintItem[] = [
  {
    id: 'c_no_auth',
    label: 'No external authentication or server-side APIs unless requested.',
    enabled: true,
  },
  {
    id: 'c_local_state',
    label: 'Keep all state handling local and robust.',
    enabled: true,
  },
  {
    id: 'c_complete_files',
    label: 'Always output complete, copy-pasteable files without truncated comments.',
    enabled: true,
  },
  {
    id: 'c_responsive',
    label: 'Make sure every button and screen works smoothly on both mobile and desktop.',
    enabled: true,
  },
];

export const BLANK_BLUEPRINT_TEMPLATE: Blueprint = {
  id: 'draft_starter',
  appName: 'Daily Cadence',
  summary:
    'A calm daily habit tracker inspired by Notion where users add routines, check them off each day, filter by category, and view a weekly summary.',
  updatedAt: '2026-11-14',
  referenceScope: {
    targetName: 'Notion',
    referenceType: 'app',
    referenceUrl: '',
    borrowedAspects: ['Page layout', 'Look & feel', 'Search & filters'],
    coreLoop:
      'Add a habit in the top bar -> check it off for today -> filter by category -> see progress on the summary card.',
    layoutPattern:
      'Single centered column with a quick input bar, filter tabs, and a clean summary card.',
    differentiator:
      'Zero sign-up required—everything saves automatically in the browser for instant daily focus.',
  },
  environment: {
    environment: 'Single-page React application using Tailwind CSS.',
    iconography: 'Lucide-react (or SVG equivalents).',
    targetScreen: 'Mobile-first responsive desktop view.',
  },
  aesthetic: {
    style: 'Swiss Minimalist',
    background: 'bg-zinc-950',
    cardSurfaces: 'bg-zinc-900 with border border-zinc-800 rounded-xl',
    typography: 'Clean sans-serif, high contrast text hierarchy',
    accent: 'Violet-500 for active states',
    motion: 'Subtle transitions (transition-all duration-150 ease-out)',
    layoutChoice: 'Single centered column (easiest to scan)',
    density: 'Spacious & calm (lots of breathing room)',
    notes: 'Use generous whitespace, 1px hairline borders, and plain everyday labels.',
    antiPatterns: [
      'Avoid decorative pill badges on static labels',
      'Avoid thick left accent borders (border-l-4) or nested boxes inside boxes',
      'Avoid fake status indicators or made-up scores',
    ],
    aiPolishedDesignPrompt: '',
    aiColorRationale: '',
    aiLayoutGuidance: '',
  },
  dataModel: {
    primaryEntities: 'HabitItem { id, title, category, completedToday, streak }',
    schemaPreview: `{
  "id": "habit_01",
  "title": "20-minute morning walk",
  "category": "Health",
  "completedToday": true,
  "streak": 4
}`,
    storageStrategy: 'localStorage with safe defaults',
  },
  features: [
    { id: 'f_input', label: 'Primary input bar', checked: false },
    { id: 'f_filters', label: 'Real-time filter controls', checked: false },
    { id: 'f_summary', label: 'Summary dashboard card', checked: false },
  ],
  constraints: DEFAULT_CONSTRAINTS.map((c) => ({ ...c })),
};

export const STARTER_BLUEPRINTS: Blueprint[] = [
  BLANK_BLUEPRINT_TEMPLATE,
  {
    ...BLANK_BLUEPRINT_TEMPLATE,
    id: 'starter_synergy_deck',
    appName: 'Synergy Deck',
    summary:
      'A turn-based tactical card-scoring web game inspired by Balatro where players draft modifier cards and clear escalating score targets.',
    updatedAt: '2026-11-14',
    referenceScope: {
      targetName: 'Balatro',
      referenceType: 'game',
      referenceUrl: '',
      borrowedAspects: ['Step-by-step flow', 'Score & progress', 'Look & feel'],
      coreLoop:
        'Draw hand -> select cards and preview multiplier math -> play hand to reach round target -> spend credits in shop.',
      layoutPattern:
        'Left run-status panel (Round, Target, Hands Left) + Central card playfield + Bottom action tray.',
      differentiator:
        'Fast 5-minute browser runs with clear pre-play score math so strategy stays transparent.',
    },
    aesthetic: {
      ...BLANK_BLUEPRINT_TEMPLATE.aesthetic,
      style: 'Tactile Arcade',
      background: 'bg-slate-950',
      cardSurfaces: 'bg-slate-900 with border border-slate-700/80 rounded-xl',
      typography: 'Outfit bold display numerals, DM Sans card descriptions, JetBrains Mono multipliers',
      accent: 'Sky-500 for active card selection',
      motion: 'Snappy 140ms card lift and score settlement transitions',
    },
    dataModel: {
      primaryEntities: 'RunState { round, targetScore, currentScore, handsLeft, deck, hand }',
      schemaPreview: `{
  "round": 1,
  "targetScore": 300,
  "currentScore": 120,
  "handsLeft": 3,
  "activeModifiers": ["Pair Boost +15"]
}`,
      storageStrategy: 'localStorage with safe defaults',
    },
    features: [
      { id: 'g_hand', label: 'Interactive hand tray with live combo preview', checked: true },
      { id: 'g_shop', label: 'Between-round modifier draft shop', checked: false },
      { id: 'g_summary', label: 'Run summary dashboard card', checked: true },
    ],
  },
  {
    ...BLANK_BLUEPRINT_TEMPLATE,
    id: 'starter_moodshelf',
    appName: 'MoodShelf',
    summary:
      'A quiet visual research archive inspired by Are.na for saving reference links, color swatches, and design notes into filterable folders.',
    updatedAt: '2026-11-14',
    referenceScope: {
      targetName: 'Are.na',
      referenceType: 'website',
      referenceUrl: '',
      borrowedAspects: ['Look & feel', 'Search & filters', 'Page layout'],
      coreLoop:
        'Paste URL or note -> assign folder -> filter cleanly by topic -> inspect or edit.',
      layoutPattern:
        'Top capture bar + breathable 3-column block grid with quiet labels.',
      differentiator:
        'Zero social feeds or vanity counters—designed solely for calm personal collecting.',
    },
    aesthetic: {
      ...BLANK_BLUEPRINT_TEMPLATE.aesthetic,
      style: 'Editorial Studio',
      background: 'bg-stone-950',
      cardSurfaces: 'bg-stone-900 with border border-stone-800 rounded-xl',
      typography: 'Plus Jakarta Sans titles, DM Sans notes, JetBrains Mono source URLs',
      accent: 'Amber-500 for active folder tabs',
      motion: 'Calm 180ms ease-out transitions',
    },
    dataModel: {
      primaryEntities: 'SavedBlock { id, title, folder, url, note, savedAt }',
      schemaPreview: `{
  "id": "blk_01",
  "title": "Minimal Grid Study",
  "folder": "Layout",
  "url": "https://example.com",
  "savedAt": "2026-11-14"
}`,
      storageStrategy: 'localStorage with safe defaults',
    },
    features: [
      { id: 'w_input', label: 'Primary input bar for URL and note capture', checked: true },
      { id: 'w_filter', label: 'Real-time folder filter controls', checked: true },
      { id: 'w_summary', label: 'Summary dashboard card for archive counts', checked: false },
    ],
  },
];
