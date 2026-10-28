export interface CharacterProfile {
  index: number;
  name: string;
  jobTitle: string;
  characterSelectVideoIndex: {
    desktop: number;
    mobile: number;
  };
  characterDescription: string;
}

export interface ScenarioAction {
  actionDescription: string;
  pointsImpact: number;
  icon?: string;
  isCorrectAnswer: boolean;
  postActionTitle: string;
  postActionDescription: string;
  postActionVideo: string;
}

export interface ScenarioQuestion {
  questionIndex: number;
  questionTitle: string;
  questionEyebrow: string;
  scenarioDescription: string;
  scenarioVideo: string;
  scenarioIcon?: string;
  actionChoices: ScenarioAction[];
}

export interface CharacterScenarioSet {
  characterIndex: number;
  jobTitle: string;
  questions: ScenarioQuestion[];
}

export type MaterialIconName = import("@/components/atoms/Icon").MaterialIconName;
