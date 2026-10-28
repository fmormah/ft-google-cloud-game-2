# Video Solutions & Configurations

## High-Level Technical Overview

## Asset sourcing (local dev + production)

The app expects video files to exist at `/assets/video/...` (mapped from `public/assets/video/...`).

- **Local development**: download the assets from Google Drive and place them into `public/assets/` (especially `public/assets/video/`):
  - Source: [Assets folder](https://drive.google.com/drive/folders/1-Ezr1HeskbaxabumG2TrURqRhEXHwKHP?usp=drive_link)
- If you want to serve videos from `public/` locally, **leave `NEXT_PUBLIC_ASSET_BASE_URL` unset**.
- **Production**: videos should be uploaded to the Google Cloud Storage bucket configured via `NEXT_PUBLIC_ASSET_BASE_URL` (see `env.example`). The bucket layout should mirror `public/assets/...` so the same `/assets/...` paths work in every environment.

### Overview

The application implements a sophisticated multi-layered video system designed for high-quality playback, smooth transitions, and optimal performance across devices. The solution supports both standard MP4 and HLS streaming formats with intelligent fallbacks, canvas-based rendering for advanced effects, and an aggressive preloading strategy.

---

## Video Architecture

### Three-Tier Video System

#### 1. **VideoPlayer** (Standard HTML5 Player)

- **Purpose**: Standard video playback with HLS support
- **Use Cases**: Background videos, scene videos, post-action videos
- **Features**:
  - Native HTML5 `<video>` element
  - HLS.js integration for adaptive streaming
  - Transition effects overlay
  - Rate-controlled seeking/rewinding
  - Audio mute state management

#### 2. **CanvasVideoPlayer** (Advanced Canvas Rendering)

- **Purpose**: Canvas-based video rendering for advanced visual effects
- **Use Cases**: Character selection, hologram displays, special effects
- **Features**:
  - Hidden video element as decoder source
  - Canvas-based frame rendering
  - Hardware-accelerated drawing
  - `requestVideoFrameCallback` API support (when available)
  - Fallback to `requestAnimationFrame` loop
  - Optimized frame rendering pipeline

#### 3. **VideoPreloader** (Background Preloading)

- **Purpose**: Proactive video loading for seamless transitions
- **Use Cases**: Preloading next scenario videos, post-action videos
- **Features**:
  - Hidden video element (off-screen)
  - Network-aware preloading (respects data saver, connection speed)
  - Priority-based loading (high/low)
  - Mobile-optimized (reduced preloading on mobile)
  - Connection quality detection

---

## Video Format Support

### Primary Formats

#### **MP4 (H.264)**

- **Usage**: Primary format for all video content
- **Configuration**: Standard MP4 files served from `/public/assets/video/`
- **Preload Strategy**: `preload="metadata"` or `preload="auto"` based on priority
- **Attributes**: `playsInline`, `muted`, `fetchPriority="high"`

#### **HLS (HTTP Live Streaming)**

- **Format**: `.m3u8` manifest files with segmented video
- **Support Detection**:
  1. Native Safari support (`canPlayType("application/vnd.apple.mpegurl")`)
  2. HLS.js polyfill for other browsers (loaded from CDN)
  3. Fallback to direct HLS URL if polyfill fails
- **Configuration**: Low-latency mode enabled

### HLS Configuration

```typescript
HLS_CONFIG = {
  lowLatencyMode: true, // Enable low-latency streaming
  maxBufferLength: 10, // Max buffer length in seconds
  maxMaxBufferLength: 30, // Maximum buffer cap
  backBufferLength: 30, // Back buffer for rewinding
  fragLoadingTimeOut: 20000, // Fragment load timeout (20s)
  manifestLoadingTimeOut: 20000, // Manifest load timeout (20s)
};
```

**CanvasVideoPlayer HLS Config:**

- Same configuration as VideoPlayer
- Optimized for canvas rendering pipeline

---

## Video Loading Strategy

### 1. **Critical Video Preloading (Layout Level)**

**Location**: `src/app/layout.tsx`

**Videos Preloaded in `<head>`:**

- Opening scene video (`/assets/video/scene_videos/opening_scene.mp4`)
- Hologram cereal video (`/assets/video/holo-vids/640x340-cereal-bowl-wireframe-rotating-2.webm`)
- Character selection video (`/assets/video/scene_videos/CharacterSelection-Desktop-PlayThrough_converted.webm`)

**Implementation:**

```html
<link
  rel="preload"
  as="video"
  href="..."
  type="video/mp4"
  fetchpriority="high"
/>
```

**Purpose**: Ensure critical videos are ready before first render

### 2. **Runtime Video Preloading**

**Component**: `VideoPreloaderManager` → `VideoPreloader`

**Strategy:**

- Preloads next scenario video when user selects an action
- Preloads post-action video on action selection
- Network-aware: Respects data saver mode and connection speed
- Mobile-optimized: Only preloads high-priority videos on mobile

**Preloading Logic:**

```typescript
// Priority-based preloading
- Desktop: Preload all videos (high/low priority)
- Mobile: Only preload high-priority videos
- Slow connections (2G/slow-2G): Skip preloading
- Data saver mode: Skip preloading
```

### 3. **On-Demand Video Loading**

**Standard Flow:**

1. Component mounts → Video source set
2. HLS detection → Native or polyfill
3. Video loads → Metadata or full (based on `preload`)
4. Playback starts → Auto-play or user-triggered

---

## Video Player Features

### VideoPlayer Features

#### **Transition Effects**

- **Transition Overlay**: Separate video element for transition effects
- **Transition Video**: `/assets/video/transition-fx.mp4`
- **Playback Rates**:
  - Normal: `2x` speed
  - Fast: `8x` speed
- **Activation**: Automatically shown during `transitionToIndex()` calls

#### **Rate-Controlled Seeking**

- **Forward Seeking**: Playback rate increase (default `4x`)
- **Rewind Seeking**: Frame-by-frame backward seeking
- **Transition Check Interval**: `33ms` (30fps)
- **Minimum Step**: `0.05s` per seek operation

#### **Methods:**

```typescript
interface VideoPlayerHandle {
  play(): void;
  pause(): void;
  toggleLoop(force?: boolean): void;
  transitionToIndex(timeSec: number, rate?: number): void;
  transitionToIndexHold(timeSec: number, rate?: number): void;
  skipTo(timeSec: number): void;
  isPaused(): boolean;
  isLooping(): boolean;
  getCurrentTime(): number;
}
```

### CanvasVideoPlayer Features

#### **Canvas Rendering Pipeline**

1. **Hidden Video Element**: Decodes video source
2. **Canvas Element**: Renders video frames
3. **Frame Rendering**:
   - Uses `requestVideoFrameCallback` when available (optimal)
   - Falls back to `requestAnimationFrame` loop
   - Hardware-accelerated `drawImage()` calls
   - Image smoothing disabled for performance

#### **Optimized Frame Rendering**

- **Canvas Resizing**: Only when video dimensions change
- **Frame Synchronization**: Tied to video playback events
- **Event-Driven Updates**: `playing`, `pause`, `seeked`, `loadeddata`, `loadedmetadata`

#### **Transition System**

- **Forward Transitions**: Playback rate increase
- **Rewind Transitions**: Frame-by-frame backward seeking
- **Mobile Optimization**: 15x faster rewind on mobile devices
- **Transition Overlay**: Visual indicator during transitions

#### **Methods:**

```typescript
interface CanvasVideoPlayerHandle {
  play(): void;
  pause(): void;
  toggleLoop(force?: boolean): void;
  transitionToIndex(timeSec: number, rate?: number): void;
  transitionToIndexHold(timeSec: number, rate?: number): void;
  skipTo(timeSec: number): void;
  isPaused(): boolean;
  isLooping(): boolean;
  getCurrentTime(): number;
}
```

---

## Video Usage Patterns

### Scene-Based Video Usage

#### **Opening Scene**

- **Background Video**: Looping background (`/assets/video/sample_video.mp4`)
- **Tile Video**: Transition effect (`/assets/video/tile-flips.mp4`)
- **Playback Rate**: Configurable (default `3.5x` for tiles)
- **Player**: `VideoPlayer`

#### **Character Selection**

- **Video**: Character selection scene (`/assets/video/scene_videos/CharacterSelection-Desktop-PlayThrough_converted.webm`)
- **Player**: `VideoPlayer` or `CanvasVideoPlayer` (depending on effects)
- **Preload**: High priority

#### **Question Scenarios**

- **Video**: Scenario-specific video (per character/scenario)
- **Path Pattern**: `/assets/video/scene_videos/character_{N}_scenarios/scenario_{M}/index.mp4`
- **Player**: `VideoPlayer`
- **Preload**: Next scenario preloaded on action selection

#### **Post-Action Videos**

- **Video**: Action-specific feedback video
- **Path Pattern**: `/assets/video/scene_videos/character_{N}_scenarios/scenario_{M}/post_action_vids/index_{ACTION_INDEX}.mp4`
- **Player**: `VideoPlayer`
- **Preload**: Preloaded when action is selected

#### **Hologram Information Scenes**

- **Video**: Hologram effect video (`/assets/video/holo-vids/640x340-cereal-bowl-wireframe-rotating-2.webm`)
- **Player**: `CanvasVideoPlayer` (for hologram effects)
- **Preload**: High priority (preloaded in layout)

---

## Performance Optimizations

### 1. **Preloading Strategy**

**Multi-Level Preloading:**

- **Critical Videos**: Preloaded in `<head>` (layout level)
- **Next Videos**: Preloaded via `VideoPreloader` component
- **Priority System**: High/low priority determines preload aggressiveness

**Network Awareness:**

- Detects connection speed (Network Information API)
- Respects data saver mode
- Mobile-specific optimizations (reduced preloading)

### 2. **HLS.js Loading**

**Dynamic Loading:**

- Loaded from CDN (`https://cdn.jsdelivr.net/npm/hls.js@latest`)
- Only loaded when HLS source is provided
- Cached in `window.Hls` to prevent duplicate loads
- Async/defer loading for non-blocking

**Fallback Chain:**

1. Native HLS support (Safari) → Direct use
2. HLS.js available → Use polyfill
3. HLS.js fails → Fallback to direct HLS URL
4. All fail → Graceful degradation

### 3. **Canvas Rendering Optimization**

**Frame Rendering:**

- `requestVideoFrameCallback` when available (optimal sync)
- `requestAnimationFrame` fallback (60fps loop)
- Hardware-accelerated `drawImage()` calls
- Image smoothing disabled for performance

**Canvas Management:**

- Canvas resized only when video dimensions change
- Frame rendering tied to video events (not continuous loop)
- Proper cleanup on unmount

### 4. **Memory Management**

**HLS Instance Cleanup:**

- HLS instances destroyed on component unmount
- HLS instances destroyed on source change
- Proper event listener cleanup

**Video Element Cleanup:**

- Source removed on unmount
- `video.load()` called to reset state
- Event listeners removed

### 5. **Mobile Optimizations**

**VideoPreloader:**

- Reduced preloading on mobile (only high-priority)
- Connection-aware preloading
- Data saver mode respect

**CanvasVideoPlayer:**

- Faster rewind transitions on mobile (15x multiplier)
- Optimized frame rendering

---

## Video Configuration Constants

### Video Player Constants

```typescript
VIDEO_PLAYER = {
  HLS_CONFIG: {
    lowLatencyMode: true,
    maxBufferLength: 10,
    maxMaxBufferLength: 30,
    backBufferLength: 30,
    fragLoadingTimeOut: 20000,
    manifestLoadingTimeOut: 20000,
  },
  DEFAULT_TRANSITION_RATE: 4, // 4x playback rate
  FX_PLAYBACK_RATE_NORMAL: 2, // 2x for transition FX
  FX_PLAYBACK_RATE: 8, // 8x for transition FX
  TRANSITION_CHECK_INTERVAL_MS: 33, // ~30fps check rate
  MIN_STEP_SEC: 0.05, // Minimum seek step
  STEP_SEC_MULTIPLIER: 0.05, // Step size multiplier
};
```

### Scene Manager Constants

```typescript
SCENE_MANAGER = {
  OPENING_INITIAL_DELAY_SEC: 5,
  OPENING_AFTER_FADE_DELAY_SEC: 0.5,
  OPENING_TILE_PLAYBACK_RATE: 3.5, // Tile video playback rate
};
```

### Asset Paths

```typescript
ASSETS = {
  VIDEO: {
    OPENING_SCENE: "/assets/video/scene_videos/opening_scene.mp4",
    CHARACTER_SELECTION:
      "/assets/video/scene_videos/CharacterSelection-Desktop-PlayThrough_converted.webm",
    HOLO_CEREAL:
      "/assets/video/holo-vids/640x340-cereal-bowl-wireframe-rotating-2.webm",
    TRANSITION_FX: "/assets/video/transition-fx.mp4",
  },
};
```

---

## Video Source Management

### Path Resolution

**Public Path Conversion:**

- Data files use `public/` prefix
- Converted to `/` for browser paths
- Function: `toPublicPath(path: string)`

**Example:**

```typescript
// Data file path
"public/assets/video/scene_videos/opening_scene.mp4";

// Browser path
"/assets/video/scene_videos/opening_scene.mp4";
```

### Video Source Priority

**Source Selection Order:**

1. `hlsSrc` provided → Use HLS (native or polyfill)
2. `src` provided → Use MP4
3. Fallback → Graceful degradation

---

## Error Handling

### HLS.js Loading Errors

- **CDN Load Failure**: Falls back to direct HLS URL
- **Polyfill Unsupported**: Falls back to direct HLS URL
- **All Failures**: Graceful degradation (video may not play)

### Video Loading Errors

- **Preload Errors**: Logged to console, don't block UI
- **Playback Errors**: Handled by video element's error event
- **Network Errors**: Handled by browser's native error handling

### Cleanup on Errors

- HLS instances destroyed
- Event listeners removed
- Video sources cleared
- Transition timers cancelled

---

## Browser Compatibility

### HLS Support Matrix

| Browser            | Native HLS | HLS.js Support | Fallback       |
| ------------------ | ---------- | -------------- | -------------- |
| Safari (iOS/macOS) | ✅ Yes     | N/A            | Direct HLS URL |
| Chrome             | ❌ No      | ✅ Yes         | Direct HLS URL |
| Firefox            | ❌ No      | ✅ Yes         | Direct HLS URL |
| Edge               | ❌ No      | ✅ Yes         | Direct HLS URL |

### Canvas API Support

- **requestVideoFrameCallback**: Chrome 94+, Edge 94+
- **Fallback**: `requestAnimationFrame` (all modern browsers)
- **Canvas 2D**: Universal support

### Network Information API

- **Connection Detection**: Chrome, Edge, Opera
- **Fallback**: Assumes good connection if unavailable
- **Data Saver Mode**: Chrome, Edge, Opera

---

## Video Preloading Flow

### Preload Decision Tree

```
User Action (e.g., selects answer)
  ↓
GameSceneLogic calculates next video
  ↓
VideoPreloaderManager receives preloadVideoSrc
  ↓
VideoPreloader checks:
  ├─ Is mobile? → Only preload if high priority
  ├─ Connection speed? → Skip if 2G/slow-2G
  ├─ Data saver? → Skip if enabled
  └─ All checks pass → Preload video
```

### Preload Timing

**Critical Videos:**

- Preloaded in `<head>` during page load
- `fetchPriority="high"`

**Next Scenario Videos:**

- Preloaded when user selects an action
- Preloaded before scene transition

**Post-Action Videos:**

- Preloaded when action is selected
- Ready before post-action scene renders

---

## Video Transition System

### Transition Types

#### **1. Standard Transition (`transitionToIndex`)**

- **Forward**: Increases playback rate, plays to target
- **Rewind**: Frame-by-frame backward seeking
- **Effect**: Transition overlay video plays during transition
- **Completion**: Returns to normal playback rate

#### **2. Hold Transition (`transitionToIndexHold`)**

- **Forward**: Increases playback rate, pauses at target
- **Rewind**: Frame-by-frame backward seeking, pauses at target
- **Effect**: Transition overlay video plays
- **Completion**: Pauses at target time

### Transition Visual Effects

**Transition Overlay:**

- Separate video element (`transition-fx.mp4`)
- Loops during transition
- Playback rate: `2x` (normal) or `8x` (fast)
- Positioned above main video
- Auto-plays and auto-pauses with transition

---

## Video Player State Management

### Audio Mute State

**Source Priority:**

1. `muted` prop (explicit)
2. `GameStore.audioMuted` (global state)
3. Default: `true` (muted)

**Implementation:**

- `VideoPlayer` uses optional `useGameStore()` hook
- Gracefully handles missing store (for standalone usage)
- Falls back to prop value

### Playback State

**Managed States:**

- Playing/Paused
- Looping
- Current time
- Transition state

**State Synchronization:**

- React refs for video element references
- `useImperativeHandle` for external control
- Event-driven state updates

---

## Performance Metrics

### Target Metrics

- **Video Load Time**: < 2s for critical videos
- **Preload Success Rate**: > 90% for high-priority videos
- **Frame Rendering**: 60fps for canvas rendering
- **Transition Smoothness**: < 500ms for standard transitions

### Optimization Techniques

- **Preloading**: Critical videos in `<head>`
- **Lazy Loading**: Non-critical videos loaded on demand
- **Network Awareness**: Respects connection quality
- **Mobile Optimization**: Reduced preloading on mobile
- **Canvas Optimization**: Hardware-accelerated rendering

---

## Future Enhancements

### Potential Improvements

1. **Adaptive Bitrate**: Dynamic quality adjustment based on connection
2. **Video CDN**: Move videos to CDN for global delivery
3. **Progressive Download**: Support for progressive MP4 download
4. **Video Analytics**: Track video load times, playback errors
5. **Offline Support**: Service worker for offline video playback
6. **WebCodecs API**: Hardware-accelerated video decoding
7. **Video Thumbnails**: Poster images for better UX
8. **Subtitle Support**: WebVTT subtitle tracks

---

_Last Updated: Based on current codebase analysis_
_Video System Version: 1.0_
