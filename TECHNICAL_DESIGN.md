# Technical Design Document

## FT Google Cloud Game 2

### Overview

An interactive, scenario-based decision-making game built with Next.js that presents users with business challenges through character selection and multiple-choice scenarios. The application features rich video content, custom cursor interactions, and a scoring system that tracks user decisions.

---

## Architecture

### Technology Stack

**Core Framework:**

- **Next.js 16.0.10** (App Router)
- **React 19.2.0**
- **TypeScript 5.8.3**

**Styling:**

- **SCSS/SASS** with CSS Modules
- **@phantomstudios/css-components** (Phantom Studios in-house styling solution)
- Custom theming via SCSS variables

**State Management:**

- React Context API + `useReducer` pattern
- Custom `GameStore` for centralized game state

**Testing & Development:**

- **Vitest** for unit testing
- **Storybook 10.1.4** for component development
- **@testing-library/react** for component testing

**Analytics & Tracking:**

- **@financial-times/o-tracking** (FT tracking)
- **@phntms/next-gtm** (Google Tag Manager)
- **Permutive** for audience analytics
- **Brandmetrics** tracking pixel

**Video Handling:**

- Custom video players with HLS.js support
- Canvas-based video rendering for advanced effects
- Video preloading system for smooth transitions

---

## Application Structure

### Directory Organization

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers, fonts, tracking
│   ├── page.tsx           # Main entry point (SceneManager)
│   └── not-found.tsx      # 404 page
│
├── components/
│   ├── atoms/             # Basic UI components (Button, Icon, ProgressLine, etc.)
│   ├── molecules/         # Composite components (InfoCard, CardNotification, etc.)
│   ├── organisms/         # Complex components (SceneManager, VideoPlayer, etc.)
│   │   ├── SceneManager/  # Core game orchestration
│   │   └── scenes/        # Individual scene components
│   ├── ErrorBoundary/     # Error handling
│   ├── OrientationPrompt/ # Mobile orientation handling
│   └── Providers/         # React context providers
│
├── store/
│   └── GameStore.tsx      # Centralized game state management
│
├── data/
│   ├── character-profiles.ts
│   └── scenarios/         # Character-specific scenario sets
│
├── hooks/                 # Custom React hooks
│   ├── useDevice.ts       # Device detection
│   ├── useRateLimit.ts    # Rate limiting for actions
│   ├── useMousePosition.ts
│   └── useWordScramble.ts
│
├── contexts/
│   └── CursorContext.tsx  # Custom cursor state management
│
├── types/
│   └── game.ts            # TypeScript type definitions
│
├── utils/
│   ├── constants.ts       # Application constants
│   └── environment.ts     # Environment variable handling
│
└── theme/
    ├── global.scss        # Global styles
    ├── fonts/             # Font configuration
    └── styles/            # Themed style modules
```

---

## Core Systems

### 1. State Management (GameStore)

**Architecture:** React Context + useReducer pattern

**State Structure:**

```typescript
interface GameState {
  activeScene: SceneKey; // Current scene identifier
  selectedCharacterIndex: number; // Index of selected character
  selectedCharacter: CharacterProfile | null;
  currentScenarioIndex: number; // Current question/scenario index
  totalScore: number; // User's cumulative score (starts at 100)
  attemptCounts: Record<string, number>; // Track attempts per scenario
  audioMuted: boolean; // Audio mute state
  chosenActionIcons: MaterialIconName[]; // Icons from selected actions
}
```

**Key Features:**

- Rate-limited actions to prevent rapid state changes
- Immutable state updates via reducer pattern
- Selector hooks for optimized re-renders
- Action creators with built-in rate limiting

**Scene Flow:**

1. `opening` → Opening scene with loading animation
2. `holoInfoIntro` → Information scene with hologram video
3. `characterSelect` → Character selection interface
4. `holoInfoPreQuestions` → Pre-question information (Deprecated)
5. `questionShell` → Question/scenario presentation
6. `postAction` → Post-decision feedback
7. `report` → Final report/summary

### 2. Scene Management System

**Components:**

- **SceneManager**: Top-level orchestrator
- **GameSceneLogic**: Business logic and event handlers (render props pattern)
- **SceneRenderer**: Scene component router
- **SceneTransitionWrapper**: Handles scene transitions
- **VideoPreloaderManager**: Preloads upcoming videos

**Key Responsibilities:**

- Scene lifecycle management
- Video preloading for smooth transitions
- Event handler coordination
- Cursor state management per scene
- HUD visibility control

### 3. Video System

**Video Players:**

- **VideoPlayer**: Standard HTML5 video with HLS support
- **CanvasVideoPlayer**: Canvas-based rendering for advanced effects

**Features:**

- HLS.js integration for adaptive streaming
- Automatic fallback to native HLS (Safari)
- Video preloading system
- Transition effects overlay
- Rate-limited transitions
- Custom playback controls

**Preloading Strategy:**

- Preloads next scenario video when user selects an action
- Preloads post-action video on action selection
- Uses `<link rel="preload">` in layout for critical videos
- Priority-based loading (high priority for critical videos)

### 4. Character & Scenario System

**Data Structure:**

- **Character Profiles**: 4 characters (CTO, CPO, CSO, CMO)
- **Scenario Sets**: Each character has multiple scenarios (questions)
- **Scenarios**: Each scenario contains:
  - Question title and description
  - Scenario video
  - Multiple action choices (3 options)
  - Each action has:
    - Points impact (+/-)
    - Correct/incorrect flag
    - Post-action video
    - Post-action title/description
    - Icon identifier

**Character Data:**

```typescript
interface CharacterProfile {
  index: number;
  name: string;
  jobTitle: string;
  characterSelectVideoIndex: number;
  characterDescription: string;
}
```

**Scenario Structure:**

```typescript
interface ScenarioQuestion {
  questionIndex: number;
  questionTitle: string;
  questionEyebrow: string;
  scenarioDescription: string;
  scenarioVideo: string;
  scenarioIcon?: string;
  actionChoices: ScenarioAction[];
}
```

### 5. Scoring System

**Mechanics:**

- Starting score: 100 points
- Points awarded/deducted based on action selection
- Only first attempt counts (subsequent attempts don't change score)
- Score tracked per scenario via `attemptCounts`
- Visual feedback via HUD score flash (positive/negative)

**Score Calculation:**

- `scoreAttempt(scenarioKey, pointsImpact)` called on first attempt
- Score clamped to minimum 0
- Icons from correct actions logged for final report

### 6. Custom Cursor System

**Implementation:**

- Custom cursor component (`ActiveCursor`)
- Context-based cursor state management
- Scene-specific cursor modes:
  - `default`: Standard cursor
  - `hover`: Interactive element hover state
- Dynamic labels per scene ("BEGIN", "SELECT", "CONTINUE")
- Visibility control based on scene and UI state
- Optimized with `useMousePositionOptimized` and `useMouseIdleOptimized`

### 7. UI Components Architecture

**Atomic Design Pattern:**

- **Atoms**: Basic building blocks (Button, Icon, ProgressLine, etc.)
- **Molecules**: Composite components (InfoCard, CardNotification, etc.)
- **Organisms**: Complex features (SceneManager, VideoPlayer, etc.)

**Key Components:**

- **GameHUD**: Score, progress, audio toggle
- **QuestionSceneShell**: Question presentation with action choices
- **PostAction**: Feedback after decision
- **CharacterSelect**: Character selection interface
- **ReportScene**: Final summary

---

## Performance Optimizations

### 1. Video Optimization

- Preloading critical videos in `<head>`
- HLS adaptive streaming for bandwidth efficiency
- Canvas-based rendering for complex effects
- Video preloading manager for smooth transitions

### 2. State Management

- Rate limiting on rapid actions (5 scene changes/sec, 3 character changes/sec)
- Memoized selectors to prevent unnecessary re-renders
- Optimized hooks (`useMousePositionOptimized`, `useMouseIdleOptimized`)

### 3. Rendering

- React 19 optimizations
- Conditional rendering based on scene state
- Lazy loading for non-critical components
- CSS Modules for scoped styling

### 4. Build Optimizations

- Next.js production optimizations
- Console removal in production (except errors/warnings)
- Source maps for production debugging
- Optimized image formats (AVIF, WebP)
- Aggressive caching headers for static assets

---

## Data Flow

### User Journey Flow

```
1. Opening Scene
   ↓ (User clicks "BEGIN")
2. HoloInfo Intro Scene
   ↓ (User clicks "NEXT")
3. Character Select Scene
   ↓ (User selects character)
4. Question Shell Scene
   ↓ (User selects action)
5. Post Action Scene
   ↓ (User clicks "CONTINUE" or "REWIND")
   ├─→ Continue: Next Question (or Report if last)
   └─→ Rewind: Back to Question Shell
6. Report Scene (after all questions)
```

### State Update Flow

```
User Action
  ↓
Event Handler (GameSceneLogic)
  ↓
GameStore Action Dispatch
  ↓
Reducer Updates State
  ↓
Components Re-render (via Context)
  ↓
Scene Transition (if needed)
  ↓
Video Preload (if needed)
```

---

## Key Features

### 1. Interactive Scenarios

- Multiple-choice decision making
- Video-based scenario presentation
- Immediate feedback on decisions
- Ability to rewind and try again

### 2. Character Selection

- 4 distinct characters with unique scenarios
- Video-based character preview
- Character-specific job titles and descriptions

### 3. Scoring & Feedback

- Real-time score updates
- Visual feedback (positive/negative flash)
- Progress tracking
- Final report generation

### 4. Video Experience

- High-quality video content
- Smooth transitions between scenes
- HLS streaming support
- Canvas-based effects

### 5. Responsive Design

- Mobile and desktop support
- Orientation prompts for mobile
- Device-specific optimizations

---

## Error Handling

### Error Boundary

- React Error Boundary wrapper
- Graceful error fallback UI
- Error logging and reporting

### Video Error Handling

- Fallback to standard video if HLS fails
- Error callbacks for preload failures
- Graceful degradation

---

## Analytics & Tracking

### Implemented Tracking

- **Google Tag Manager**: Page views and events
- **FT Tracking (o-tracking)**: Custom events
- **Permutive**: Audience analytics
- **Brandmetrics**: Engagement tracking

### Tracked Events

- Scene transitions
- Character selection
- Action selections
- Score changes
- Video interactions

---

## Development Workflow

### Scripts

- `npm run dev`: Development server
- `npm run dev:turbo`: Turbo mode development
- `npm run build`: Production build
- `npm run test`: Run tests
- `npm run storybook`: Component development
- `npm run lint`: Code linting

### Code Quality

- ESLint for JavaScript/TypeScript
- Stylelint for SCSS
- TypeScript strict mode
- Prettier formatting

---

## Deployment

### Platform

- **Vercel** (configured via `vercel.json`)
- Environment variables for production URL
- Optimized for Vercel's edge network

### Build Configuration

- **TypeScript**: `moduleResolution: "bundler"` for modern ESM support
- Production source maps enabled
- Console removal in production
- Optimized asset caching
- Image optimization

---

## Future Considerations

### Potential Enhancements

1. **Persistence**: Save game state to localStorage/backend
2. **Multiplayer**: Compare scores with other users
3. **Analytics Dashboard**: Track user decisions and outcomes
4. **A/B Testing**: Test different scenario variations
5. **Accessibility**: Enhanced keyboard navigation and screen reader support
6. **Internationalization**: Multi-language support
7. **Backend Integration**: Store results, leaderboards, etc.

### Technical Debt

- Consider migrating to Zustand or Redux Toolkit for more complex state
- Video CDN optimization for global delivery
- Progressive Web App (PWA) features
- Service worker for offline support

---

## Dependencies Summary

### Production Dependencies

- Next.js, React, React DOM
- Financial Times Origami components
- Phantom Studios components
- Material Symbols icons
- Classnames utility

### Development Dependencies

- TypeScript
- Vitest, Testing Library
- Storybook
- ESLint, Stylelint
- SASS compiler

---

## Security Considerations

1. **XSS Prevention**: React's built-in XSS protection
2. **CSP Headers**: Should be configured in production
3. **Environment Variables**: Sensitive data in env vars only
4. **Dependency Updates**: Regular security audits

---

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- HLS support via native or HLS.js polyfill
- Canvas API for video effects
- CSS Grid and Flexbox

---

## Performance Metrics

### Target Metrics

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Video load time: < 2s
- Smooth 60fps animations

### Optimization Techniques

- Video preloading
- Code splitting via Next.js
- Image optimization
- Font preloading
- DNS prefetching for external resources

---

_Last Updated: Based on current codebase analysis_
_Version: 0.1.0_
