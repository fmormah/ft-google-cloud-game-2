import { assetUrl } from "@/utils/assetUrl";
import type { VideoSource } from "@/types/video";

export const VIDEO_PLAYER = {
  HLS_CONFIG: {
    lowLatencyMode: true,
    maxBufferLength: 10,
    maxMaxBufferLength: 30,
    backBufferLength: 30,
    fragLoadingTimeOut: 20000,
    manifestLoadingTimeOut: 20000,
  },

  DEFAULT_TRANSITION_RATE: 4,
  FX_PLAYBACK_RATE_NORMAL: 2,
  FX_PLAYBACK_RATE: 8,
  TRANSITION_CHECK_INTERVAL_MS: 33,
  MIN_STEP_SEC: 0.05,
  STEP_SEC_MULTIPLIER: 0.05,
  // Cap canvas backing-store size on mobile to reduce memory pressure.
  MOBILE_CANVAS_MAX_PIXELS: 1280 * 720,
} as const;

export const SCENE_MANAGER = {
  OPENING_INITIAL_DELAY_SEC: 7.5,
  OPENING_AFTER_FADE_DELAY_SEC: 0.5,
  OPENING_TILE_PLAYBACK_RATE: 3.5,
  QUESTION_AUTO_REVEAL_RESET_DELAY_MS: 0,
  PROGRESS_STEPS: 5,
  HUD_ANIMATE_IN_DELAY_SEC: 1,
} as const;

export const OPENING_SCENE = {
  PRIMARY_IRIS_DASH_LENGTH: 2,
  PRIMARY_IRIS_DASH_HEIGHT: 1,
  PRIMARY_IRIS_GAP_LENGTH: 5,
  PRIMARY_IRIS_ROTATION_SPEED_SEC: 60,
  SECONDARY_IRIS_DASH_LENGTH: 5,
  SECONDARY_IRIS_DASH_HEIGHT: 1,
  SECONDARY_IRIS_GAP_LENGTH: 14,
  SECONDARY_IRIS_ROTATION_SPEED_SEC: 60,
  TRAIL_LINE_HEIGHT_PX: 10,
  TRAIL_LINE_WIDTH_PX: 1,
  TRAIL_GAP_PX: 21,
  TRAIL_DURATION_SEC: 50,
} as const;

export const GAME_LOGIC = {
  DEFAULT_STARTING_SCORE: 100,
  SCENARIO_KEY_SEPARATOR: ":",
} as const;

export const UI = {
  MATERIAL_ICON_DEFAULT_SIZE_PX: 24,
  MATERIAL_ICON_OPTICAL_SIZE: 24,
  MATERIAL_ICON_WEIGHT: 100,
  MATERIAL_ICON_GRADE: 0,
  MATERIAL_ICON_FILL: 0,
  BUTTON_CORNER_SIZE_PX: 5,
} as const;

export const ASSETS = {
  VIDEO: {
    OPENING_SCENE: assetUrl(
      "/assets/video/scene_videos/opening-splash_Video_converted.webm"
    ),
    CHARACTER_SELECTION: assetUrl(
      "/assets/video/scene_videos/CharacterSelection-Desktop-PlayThrough.mp4"
    ),
    CHARACTER_SELECTION_MOBILE: assetUrl(
      "/assets/video/scene_videos/CharacterSelection-Mobile-PlayThrough.mp4"
    ),
    HOLO_CEREAL: assetUrl(
      "/assets/video/holo-vids/640x340-cereal-bowl-wireframe-rotating-2.webm"
    ),
    TRANSITION_FX: assetUrl("/assets/video/transition-fx.mp4"),
    EOY_REPORT_BG_LOOP: assetUrl(
      "/assets/video/Welcome_EOY%20Report_converted.webm"
    ),
    HOLO_404_BG_LOOP: assetUrl(
      "/assets/video/404Page%20NO%20SOUND_converted.webm"
    ),
    HOLO_404_DISPLAY: assetUrl(
      "/assets/video/holo-vids/640x340-cereal-bowl-wireframe-rotating-2.webm"
    ),
    HOLO_INTRO_DISPLAY: assetUrl(
      "/assets/video/holo-vids/540x540-cereal-box-transition-render-to-wireframe.webm"
    ),
  },
  VIDEO_SOURCES: {
    HOLO_CEREAL: [
      {
        src: assetUrl(
          "/assets/video/holo-vids/640x340-cereal-bowl-wireframe-rotating-2.webm"
        ),
        type: "video/webm",
      },
      {
        src: assetUrl(
          "/assets/video/holo-vids/640x340-cereal-bowl-wireframe-rotating-2.mp4"
        ),
        type: "video/mp4",
      },
    ] satisfies VideoSource[],
    HOLO_404_DISPLAY: [
      {
        src: assetUrl(
          "/assets/video/holo-vids/640x340-cereal-bowl-wireframe-rotating-2.webm"
        ),
        type: "video/webm",
      },
      {
        src: assetUrl(
          "/assets/video/holo-vids/640x340-cereal-bowl-wireframe-rotating-2.mp4"
        ),
        type: "video/mp4",
      },
    ] satisfies VideoSource[],
    HOLO_INTRO_DISPLAY: [
      {
        src: assetUrl(
          "/assets/video/holo-vids/540x540-cereal-box-transition-render-to-wireframe.webm"
        ),
        type: "video/webm",
      },
      {
        src: assetUrl(
          "/assets/video/holo-vids/540x540-cereal-box-transition-render-to-wireframe.mp4"
        ),
        type: "video/mp4",
      },
    ] satisfies VideoSource[],
    TROPHY_GOLD: [
      {
        src: assetUrl("/assets/video/trophies/gold-trophy-rotating.webm"),
        type: "video/webm",
      },
      {
        src: assetUrl("/assets/video/trophies/gold-trophy-rotating.mp4"),
        type: "video/mp4",
      },
    ] satisfies VideoSource[],
    TROPHY_SILVER: [
      {
        src: assetUrl("/assets/video/trophies/silver-trophy-rotating.webm"),
        type: "video/webm",
      },
      {
        src: assetUrl("/assets/video/trophies/silver-trophy-rotating.mp4"),
        type: "video/mp4",
      },
    ] satisfies VideoSource[],
    TROPHY_BRONZE: [
      {
        src: assetUrl("/assets/video/trophies/bronze-trophy-rotating.webm"),
        type: "video/webm",
      },
      {
        src: assetUrl("/assets/video/trophies/bronze-trophy-rotating.mp4"),
        type: "video/mp4",
      },
    ] satisfies VideoSource[],
  },
} as const;

export const ANIMATION = {
  INFOCARD: {
    INTRO_TOTAL_DURATION: 2250,
    REVERSE_DURATION: 400,
    PEEK_DELAY: 750,
    REVEAL_DELAY: 1500,
  },

  BUTTONS: {
    STAGGER_DELAY: 150,
    REVEAL_DURATION: 600,
    POST_INFOCARD_DELAY: 150,
  },

  CHARACTER_CHANGE: {
    REVERSE_TO_INTRO_DELAY: 400,
    TOTAL_SEQUENCE_DURATION: 2650,
  },
} as const;
