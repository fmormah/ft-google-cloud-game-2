import { useFTTracker } from "@phantomstudios/ft-react-components";

type ScenarioNumber = 1 | 2 | 3 | 4 | 5;
type ScenarioCorrectness = "correct_answer" | "incorrect_answer";
type CharacterName = "stella" | "sidney" | "mo" | "ali";

export type AnalyticsEventName =
  | "Begin"
  | "Welcome continue"
  | "character_back"
  | "character_next"
  | "character_select"
  | "Stella character"
  | "Sidney character"
  | "Mo character"
  | "Ali character"
  | "answer_select"
  | "skip_video"
  | "Skip video 1"
  | "Skip video 2"
  | "Skip video 3"
  | "Skip video 4"
  | "Skip video 5"
  | "answer_correct"
  | "answer_incorrect"
  | "answer_rewind"
  | "Rewind to scenario 1"
  | "Rewind to scenario 2"
  | "Rewind to scenario 3"
  | "Rewind to scenario 4"
  | "Rewind to scenario 5"
  | "answer_continue"
  | "See how you did"
  | "Scenario 1 correct answer"
  | "Scenario 1 incorrect answer"
  | "Scenario 2 correct answer"
  | "Scenario 2 incorrect answer"
  | "Scenario 3 correct answer"
  | "Scenario 3 incorrect answer"
  | "Scenario 4 correct answer"
  | "Scenario 4 incorrect answer"
  | "Scenario 5 correct answer"
  | "Scenario 5 incorrect answer"
  | "play_again"
  | "year_in_review"
  | "Career highlights"
  | "Career highlights 1"
  | "Career highlights 2"
  | "Career highlights 3"
  | "Game complete"
  | "Click article"
  | "Click learn more"
  | "Restart game"
  | "share"
  | "sound_player"
  | "audio_play"
  | "audio_pause"
  | "video_title"
  | "video_url"
  | "video_duration"
  | "video_play"
  | "video_playing"
  | "video_pause"
  | "video_percent"
  | "social_share"
  | "link_url"
  | "click_text";

export interface AnalyticsEventParams {
  character?: string;
  question?: string;
  answer?: string;
  answer_given?: string;
  counter?: string | number;
  sound_on?: boolean;
  // Allow arbitrary analytics fields (e.g., video_* and click_* payloads)
  [key: string]: string | number | boolean | undefined;
}

export function useAnalytics() {
  const { FTTracker } = useFTTracker();

  const trackEvent = (
    eventName: AnalyticsEventName,
    params?: AnalyticsEventParams
  ) => {
    if (process.env.NEXT_PUBLIC_PORTFOLIO_DEMO === "true") return;
    if (process.env.NODE_ENV === "development" && !FTTracker) {
      console.log("[Analytics]", eventName, params);
    }

    try {
      const eventParams: Record<string, string | number | boolean> = {};

      if (params) {
        if (params.character) {
          eventParams.character = params.character;
        }
        if (params.question) {
          eventParams.question = params.question;
        }
        if (params.answer) {
          eventParams.answer = params.answer;
        }
        if (params.answer_given) {
          eventParams.answer_given = params.answer_given;
        }
        if (params.counter !== undefined) {
          eventParams.counter = String(params.counter);
        }
        if (params.sound_on !== undefined) {
          eventParams.sound_on = params.sound_on;
        }

        Object.entries(params).forEach(([key, value]) => {
          if (
            value === undefined ||
            key === "character" ||
            key === "question" ||
            key === "answer" ||
            key === "answer_given" ||
            key === "counter" ||
            key === "sound_on"
          ) {
            return;
          }

          if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
          ) {
            eventParams[key] = value;
          } else {
            eventParams[key] = String(value);
          }
        });
      }

      // Map to UA-style fields for GTM compatibility
      const uaFields = mapToUAStyle(eventName, params);
      
      // Always push to dataLayer with UA-style fields for GTM
      if (
        typeof window !== "undefined" &&
        (window as { dataLayer?: Array<unknown> }).dataLayer
      ) {
        const safeLabel = uaFields.label ?? "";
        const safeDisplayName = uaFields.displayName ?? "";
        (window as { dataLayer: Array<unknown> }).dataLayer.push({
          event: eventName,
          // Universal Analytics style fields for GTM GA4 custom event tags
          category: uaFields.category,
          action: uaFields.action,
          // IMPORTANT: Always set these keys so GTM dataLayer variables don't
          // "stick" to a previous value when a subsequent event omits them.
          label: safeLabel,
          event_display_name: safeDisplayName,
          // Some GTM setups read these legacy-looking keys (as shown in Tag Assistant)
          // so ensure they're always present too.
          event_category: uaFields.category,
          event_action: uaFields.action,
          event_label: safeLabel,
          // Original event params (for FTTracker and custom GA4 events)
          ...eventParams,
        });
      }

      if (!FTTracker) {
        // In dev, fall back to console-only logging if the FT tracker
        // has not initialised yet, rather than throwing.
        if (process.env.NODE_ENV === "development") {
          console.log("[Analytics FTTracker missing]", eventName, eventParams);
        }
        return;
      }

      const trackerAny = FTTracker as unknown as {
        track?: (event: string, data?: Record<string, unknown>) => void;
        event?: (event: string, data?: Record<string, unknown>) => void;
        trackEvent?: (event: string, data?: Record<string, unknown>) => void;
      };

      if (trackerAny.trackEvent) {
        trackerAny.trackEvent(eventName, eventParams);
      } else if (trackerAny.track) {
        trackerAny.track(eventName, eventParams);
      } else if (trackerAny.event) {
        trackerAny.event(eventName, eventParams);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Analytics Error]", error);
      }
    }
  };

  return { trackEvent };
}

export function formatCharacterId(characterIndex: number): string {
  return `CH${characterIndex + 1}`;
}

export function formatQuestionId(
  characterIndex: number,
  questionIndex: number
): string {
  return `CH${characterIndex + 1}Q${questionIndex + 1}`;
}

export function formatAnswerId(answerIndex: number): string {
  return `A${answerIndex + 1}`;
}

/**
 * Maps event name and params to Universal Analytics style (category, action, label)
 * for GTM compatibility. GTM GA4 tags often expect these fields.
 */
function mapToUAStyle(
  eventName: AnalyticsEventName,
  params?: AnalyticsEventParams
): { category: string; action: string; label?: string; displayName?: string } {
  // Determine category based on event name prefix/type
  let category = "Game";
  if (eventName.startsWith("video_") || eventName.startsWith("audio_")) {
    category = "Media";
  } else if (eventName.startsWith("character_")) {
    category = "Character";
  } else if (eventName.endsWith(" character") || eventName === "Stella character" || eventName === "Sidney character" || eventName === "Mo character" || eventName === "Ali character") {
    category = "Character";
  } else if (eventName.startsWith("answer_")) {
    category = "Answer";
  } else if (eventName.startsWith("Scenario ") || eventName.startsWith("scenario_")) {
    category = "Scenario";
  } else if (eventName.startsWith("Skip video ") || eventName.startsWith("Rewind to scenario ") || eventName.startsWith("skip_video_") || eventName.startsWith("rewind_to_scenario_")) {
    category = "Scenario";
  } else if (eventName.startsWith("Click ") || eventName.startsWith("click_") || eventName === "link_url" || eventName === "social_share") {
    category = "Click";
  } else if (eventName === "share" || eventName === "play_again" || eventName === "year_in_review" || eventName === "Restart game") {
    category = "Engagement";
  }

  const displayName = toDisplayName(eventName);
  // Action defaults to event name, but can be overridden to a human-readable display name.
  const action = displayName ?? eventName;

  // Build label from params
  const labelParts: string[] = [];
  if (params?.character) labelParts.push(params.character);
  if (params?.question) labelParts.push(params.question);
  if (params?.answer) labelParts.push(params.answer);
  if (params?.answer_given) labelParts.push(`given:${params.answer_given}`);
  if (params?.click_text !== undefined) {
    const clickText =
      typeof params.click_text === "string"
        ? params.click_text
        : String(params.click_text);
    labelParts.push(clickText.slice(0, 50));
  }
  if (params?.video_title !== undefined) {
    const videoTitle =
      typeof params.video_title === "string"
        ? params.video_title
        : String(params.video_title);
    labelParts.push(videoTitle.slice(0, 50));
  }
  
  const label = labelParts.length > 0 ? labelParts.join(" | ") : undefined;

  return { category, action, label, displayName };
}

function toDisplayName(eventName: AnalyticsEventName): string | undefined {
  // For events that already match the display name format, return as-is
  if (
    eventName === "Begin" ||
    eventName === "Welcome continue" ||
    eventName === "See how you did" ||
    eventName === "Career highlights" ||
    eventName === "Game complete" ||
    eventName === "Click article" ||
    eventName === "Click learn more" ||
    eventName === "Restart game" ||
    eventName === "Stella character" ||
    eventName === "Sidney character" ||
    eventName === "Mo character" ||
    eventName === "Ali character"
  ) {
    return eventName;
  }

  // Template literal types that match the pattern
  if (typeof eventName === "string") {
    if (eventName.startsWith("Skip video ")) {
      return eventName;
    }
    if (eventName.startsWith("Rewind to scenario ")) {
      return eventName;
    }
    if (eventName.startsWith("Scenario ") && (eventName.includes(" correct answer") || eventName.includes(" incorrect answer"))) {
      return eventName;
    }
    if (eventName.startsWith("Career highlights ")) {
      return eventName;
    }
  }

  // Legacy event names that need conversion (for backward compatibility during transition)
  const scenarioCorrect = eventName.match(/^scenario_(\d+)_(correct_answer|incorrect_answer)$/);
  if (scenarioCorrect) {
    return `Scenario ${scenarioCorrect[1]} ${scenarioCorrect[2].replace(/_/g, " ")}`;
  }

  const skipVideo = eventName.match(/^skip_video_(\d+)$/);
  if (skipVideo) return `Skip video ${skipVideo[1]}`;

  const rewind = eventName.match(/^rewind_to_scenario_(\d+)$/);
  if (rewind) return `Rewind to scenario ${rewind[1]}`;

  const careerHighlight = eventName.match(/^career_highlights_(\d+)$/);
  if (careerHighlight) return `Career highlights ${careerHighlight[1]}`;

  const character = eventName.match(/^(stella|sidney|mo|ali)_character$/);
  if (character) {
    const name = character[1];
    return `${name.charAt(0).toUpperCase()}${name.slice(1)} character`;
  }

  return undefined;
}
