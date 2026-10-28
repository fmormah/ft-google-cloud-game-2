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

// Analytics are disabled in every environment; UI calls have no side effects.
export function useAnalytics() {
  const trackEvent = (_eventName: AnalyticsEventName, _params?: AnalyticsEventParams): void => {};
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
