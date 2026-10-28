# FT Google Cloud Game 2

Public portfolio demo: [Open the live project](https://fmormah.github.io/ft-google-cloud-game-2/).

## GitHub Pages

Pushes to `main` build and deploy automatically through `.github/workflows/pages.yml`. Use Node.js 24 and `npm ci` for reproducible installs. Local development remains available with `npm run dev`.

To reproduce the hosted build locally:

```sh
GITHUB_PAGES=true NEXT_PUBLIC_PORTFOLIO_DEMO=true NEXT_PUBLIC_BASE_PATH=/ft-google-cloud-game-2 NEXT_PUBLIC_URL=https://fmormah.github.io/ft-google-cloud-game-2 NEXT_PUBLIC_SCENARIO_ASSET_BASE_URL=https://storage.googleapis.com/ft-cloud-game-2 npm run build:pages
```

`out/` is the deployable static site. The post-build script scopes public media URLs to the repository path, including CSS, browser bundles, and exported pages. Campaign analytics are disabled in portfolio mode.

The supplied audio/video assets and ten restored opening/trophy videos are included in this repository. The archive omitted 140 character scenario video variants (about 1.28 GB); the hosted demo streams those from the project's existing public bucket through `NEXT_PUBLIC_SCENARIO_ASSET_BASE_URL`. All 140 URLs were checked successfully. Keep that bucket available, or mirror it and change this setting. The icon routes are rendered at build time.

## Automated tests

Run `npm run test:ci` for the application unit and integration suite. After producing the Pages build above, run `npx playwright install chromium` and `npm run test:e2e` for Chromium desktop and mobile journeys against `out/` at the production project path.

The browser tests play Stella's complete five-scenario journey, assert each score, check all three highlights and the annual report, restart and verify a clean score/history, and cover a wrong answer followed by rewind and retry. They use real game components and browser video events, with a small checked-in MP4 replacing video responses for deterministic execution. They do not verify the external video bucket's availability, visual fidelity, every character's content, or Safari/Firefox behavior.

Scene-transition regressions also cover rapid re-entry and animation events from nested content. GitHub Pages runs both suites before uploading the deployable site; browser tests must pass without flaky retries. Failed browser runs retain traces, screenshots, and an HTML report as workflow artifacts for seven days.

## Original project notes

# FT Google Cloud Game 2

An interactive, scenario-based decision-making game built with Next.js that presents users with business challenges through character selection and multiple-choice scenarios. The application features rich video content, custom cursor interactions, and a scoring system that tracks user decisions.

## Overview

This is a Next.js application that provides an immersive gaming experience where users:

- Select from 4 different characters (CTO, CPO, CSO, CMO)
- Navigate through character-specific business scenarios
- Make decisions that impact their score
- Receive immediate feedback on their choices
- View a final report summarizing their performance

## Technology Stack

- **Framework**: Next.js 16.0.10 (App Router)
- **React**: 19.2.1
- **TypeScript**: 5.8.3
- **Styling**: SCSS/SASS with CSS Modules
- **State Management**: Reducer-based store with `useSyncExternalStore` selectors
- **Testing**: Vitest, Storybook, Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Add required assets (video + audio)

This project references media under `public/assets/` (notably `video/` + `audio/`), but **the large binary assets are not intended to be committed to git**.

- **Local development (recommended)**: download the assets from Google Drive and place them into `public/assets/` so paths like `/assets/video/...` resolve locally.
  - Source: [Assets folder](https://drive.google.com/drive/folders/1-Ezr1HeskbaxabumG2TrURqRhEXHwKHP?usp=drive_link)
  - Target: `public/assets/video/`, `public/assets/audio/` (and any other `public/assets/*` folders provided)
  - Note: to serve assets from `public/` locally, **leave `NEXT_PUBLIC_ASSET_BASE_URL` unset**.

- **Using the production bucket locally (optional)**: set `NEXT_PUBLIC_ASSET_BASE_URL` (see `env.example`) or run:

```bash
npm run dev:bucket
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment variables

Copy `env.example` to `.env.local` and fill in values as needed.

### Development Scripts

- `npm run dev` - Start development server
- `npm run dev:turbo` - Start development server with Turbo mode
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run storybook` - Start Storybook
- `npm run lint` - Run ESLint and Stylelint
- `npm run lint:fix` - Fix linting issues automatically
- `npm run type-check` - Run TypeScript type checking

## Documentation

### Technical Documentation

- **[Technical Design Document](./TECHNICAL_DESIGN.md)** - Comprehensive overview of the application architecture, systems, and design decisions
- **[Video Solutions & Configurations](./VIDEO_SOLUTIONS.md)** - Detailed documentation of the video system, including players, preloading strategies, and optimizations

### Additional Resources

- [Example Feature Doc](./docs/EXAMPLE.md) - Example documentation structure
- [SCSS Styles Documentation](./src/theme/styles/README.md) - Styling patterns and usage
- [Assets Download Instructions](./docs/ASSETS_DOWNLOAD.md) - Instructions for downloading assets from Google Cloud Storage bucket

## Key Features

### Interactive Gameplay

- Character selection with video previews
- Scenario-based decision making
- Real-time scoring system
- Ability to rewind and retry scenarios

### Video System

- Multi-format support (MP4, HLS)
- Canvas-based rendering for advanced effects
- Intelligent video preloading
- Smooth scene transitions

### User Experience

- Custom cursor interactions
- Responsive design (mobile & desktop)
- Audio controls
- Progress tracking

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main entry point
├── components/            # React components (atomic design)
│   ├── atoms/            # Basic UI components
│   ├── molecules/        # Composite components
│   └── organisms/        # Complex features
├── store/                 # State management
├── data/                  # Character profiles & scenarios
├── hooks/                 # Custom React hooks
├── contexts/              # React contexts
├── types/                 # TypeScript definitions
├── utils/                 # Utilities & constants
└── theme/                 # Styling & theming
```

## Styling

### CSS Components

This project uses [CSS Components](https://css-components.net), Phantom Studios' in-house styling solution.

### Theming

Theming is handled via SCSS variables in `src/theme/*`. Fonts are configured in `src/theme/fonts/`.

### Linting

- **Stylelint**: SCSS linting with alphabetical property ordering
- **ESLint**: JavaScript/TypeScript linting

## Deployment

### Vercel Deployment

This project is configured for deployment on Vercel:

1. Ensure the project is part of the Phantom Studios org
2. Deploy via [Vercel web UI](https://vercel.com/new) or CLI
3. Set environment variables:
   - `NEXT_PUBLIC_URL` - The final production URL (https:/transformingbusiness.ft.com)
   - `PERMUTIVE_PROJECT_ID` - Permutive project ID for audience analytics
   - `PERMUTIVE_PUBLIC_API_KEY` - Permutive public API key

### Build Configuration

- Production source maps enabled
- Console removal in production (except errors/warnings)
- Optimized asset caching
- Image optimization (AVIF, WebP)

### Asset workflow (local vs production)

- **Local**: assets live at `public/assets/...` and are served as `/assets/...`.
- **Production**: assets should be uploaded to the Google Cloud Storage bucket used by `NEXT_PUBLIC_ASSET_BASE_URL` (example/default in `env.example`: `https://storage.googleapis.com/ft-cloud-game-2`).
- **Important**: uploads to the production bucket should **mirror the same folder structure** as the local `public/assets/...` layout so that `/assets/...` paths work identically in both environments.

## Development Workflow

### Code Quality

- TypeScript strict mode
- ESLint + Prettier for code formatting
- Stylelint for SCSS
- Pre-commit hooks (if configured)

### Testing

- Unit tests with Vitest
- Component tests with Testing Library
- Storybook for component development

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- HLS support via native or HLS.js polyfill
- Canvas API for video effects
- CSS Grid and Flexbox

## Performance

### Target Metrics

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Video load time: < 2s
- Smooth 60fps animations

### Optimizations

- Video preloading
- Code splitting
- Image optimization
- Font preloading
- DNS prefetching

## Support

### Resources

- [Middleware Asset Processing](https://docs.google.com/document/d/1xaTQ_oJzCxkeaUAaHEcH4SqMEnfEBvoXLRAtFN1y1Lw) - Learnings from past projects

## License

[Add license information if applicable]
