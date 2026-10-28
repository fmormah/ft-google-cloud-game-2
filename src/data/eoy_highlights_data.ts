import type { CharacterProfile, CharacterScenarioSet } from "@/types/game";
import { characterProfiles } from "@/data/character-profiles";
import { characterIndex0Scenarios } from "@/data/scenarios/character_index_0_scenarios";
import { characterIndex1Scenarios } from "@/data/scenarios/character_index_1_scenarios";
import { characterIndex2Scenarios } from "@/data/scenarios/character_index_2_scenarios";
import { characterIndex3Scenarios } from "@/data/scenarios/character_index_3_scenarios";
import { assetUrl } from "@/utils/assetUrl";

/**
 * Default highlight question indices.
 * Keep this flexible: the UI should work for any number of highlight indices.
 */
export const DEFAULT_EOY_HIGHLIGHT_QUESTION_INDICES: readonly number[] = [
  0, 1, 3,
];

/**
 * Per-character highlight selection to match the conclusion tracker.
 * These are the 3 “pivotal career moments” shown on the highlights carousel.
 */
export const DEFAULT_EOY_HIGHLIGHT_QUESTION_INDICES_BY_CHARACTER_INDEX: Record<
  number,
  readonly number[]
> = {
  // Stella (CEO): Supply Chain (0), Scaling Internationally (2), Cybersecurity (3)
  0: [0, 2, 3],
  // Sidney (CIO): Cybersecurity (0), Energy (2), Greenwashing/Transparency (3)
  1: [0, 2, 3],
  // Mo (CSCO): Fleet (0), Regulatory/Compliance (1), Water (3)
  2: [0, 1, 3],
  // Ali (CFO): Demand Forecasting (0), Water (2), Fleet (3)
  3: [0, 2, 3],
};

export type EoyHighlightOutcome = "win" | "loss";

export interface EoyHighlightItem {
  questionIndex: number;
  includeInEndOfYearHighlights: boolean;
  highlightTitleWin: string;
  highlightTitleLoss?: string;
  highlightCopyWin: string;
  highlightCopyLoss?: string;
  highlightLogo: string;
  highlightBackgroundImage?: string;
  highlightVideoOverride?: string;
}

export interface EoyHighlightsCharacter {
  character: CharacterProfile;
  series: EoyHighlightItem[];
}

type EoyHighlightOverride = Partial<
  Pick<
    EoyHighlightItem,
    | "highlightTitleWin"
    | "highlightTitleLoss"
    | "highlightCopyWin"
    | "highlightCopyLoss"
    | "highlightLogo"
    | "highlightBackgroundImage"
    | "highlightVideoOverride"
  >
>;

const scenariosByCharacterIndex: Record<number, CharacterScenarioSet> = {
  0: characterIndex0Scenarios,
  1: characterIndex1Scenarios,
  2: characterIndex2Scenarios,
  3: characterIndex3Scenarios,
};

const DEFAULT_HIGHLIGHT_LOGO = assetUrl("/assets/images/crab.png");

const HIGHLIGHT_OVERRIDES_BY_CHARACTER_AND_QUESTION_INDEX: Record<
  number,
  Record<number, EoyHighlightOverride>
> = {
  // Stella (CEO)
  0: {
    0: {
      highlightTitleWin: "Protecting the organisation",
      highlightTitleLoss: "Protecting the organisation",
      highlightCopyWin:
        "You implemented TraceMark, a sustainable sourcing platform by Google Cloud partner, NGIS. The solution used satellite data to provide supply chain transparency, which protected Sunrise Cereals Co.'s reputation, ensured compliance and increased investor confidence.",
      highlightCopyLoss:
        "You declined to implement NGIS Tracemark, forgoing the opportunity for satellite-based supply chain visibility. This lack of transparency hid unsustainable practices that eventually came to light. Sunrise Cereals faced compliance violations, causing significant reputational damage and a sharp drop in share prices.",
      highlightLogo:
        "/assets/images/icons/end_of_year_logos/NGIS Tracemark_Logo@3x_converted.webp",
    },
    2: {
      highlightTitleWin: "New market Sovereignty",
      highlightTitleLoss: "New market Sovereignty",
      highlightCopyWin:
        "By investing in cloud sovereignty partnership, you enabled cost-cutting AI deployments with strict data boundaries across Europe, significantly boosting stock prices and future-proofing operations.",
      highlightCopyLoss:
        "Without a cloud sovereignty partnership, compliance risks blocked AI deployment. Spiralling operational costs and a lack of innovation caused share prices to stagnate.",
      highlightLogo:
        "/assets/images/icons/end_of_year_logos/Sovereign Cloud (Google Cloud)_Logo@3x_converted.webp",
    },
    3: {
      highlightTitleWin: "Were you cybersecure?",
      highlightTitleLoss: "Were you cybersecure?",
      highlightCopyWin:
        "When cybersecurity threats were on the rise, you implemented AI threat detection for risk mitigation insights. The success led to your podcast appearance, raising Sunrise Cereals' profile and positioning you as a market leader.",
      highlightCopyLoss:
        "Despite rising threats, you hesitated to implement AI mitigation. While competitors fortified defences, Sunrise Cereals suffered preventable intrusions. This lack of foresight eroded brand trust, forcing you to apologise to frustrated shareholders rather than sharing success.",
      highlightLogo:
        "/assets/images/icons/end_of_year_logos/Cyber security (Google Cloud)_Logo@3x_converted.webp",
    },
  },

  // Sidney (CIO)
  1: {
    0: {
      highlightTitleWin: "Were you cybersecure?",
      highlightTitleLoss: "Were you cybersecure?",
      highlightCopyWin:
        "When cybersecurity threats were on the rise, you implemented AI threat detection for risk mitigation insights. The success led to your podcast appearance, raising Sunrise Cereals' profile and positioning you as a market leader.",
      highlightCopyLoss:
        "Despite rising cybersecurity threats, you hesitated to implement AI tools for mitigation. While competitors fortified their defenses, Sunrise Cereals suffered a series of preventable intrusions. The lack of foresight eroded brand trust, forcing you to apologize to frustrated shareholders rather than sharing success stories.",
      highlightLogo:
        "/assets/images/icons/end_of_year_logos/Cyber security (Google Cloud)_Logo@3x_converted.webp",
    },
    2: {
      highlightTitleWin: "Energy consumption",
      highlightTitleLoss: "Energy consumption",
      highlightCopyWin:
        "You integrated a cloud-native energy management platform to monitor consumption. The system’s AI algorithms actively optimised energy use across  sites, significantly reducing both costs and emissions without disrupting your daily production schedules or output.",
      highlightCopyLoss:
        "You failed to address the root cause: inefficient energy consumption. By bypassing real-time analytics, you lack the visibility to reduce wasted power. Your energy costs continue to rise with production, eroding margins while your sustainability goals drift further away.",
      highlightLogo:
        "/assets/images/icons/end_of_year_logos/Smart Grid Analytics_Logo@3x_converted.webp",
    },
    3: {
      highlightTitleWin: "Transparency",
      highlightTitleLoss: "Transparency",
      highlightCopyWin:
        "You leveraged NotebookLM from Google Cloud to transform dense ESG reports into an interactive consumer experience. By allowing the public to query your data directly, you proved your claims were authentic, helping neutralise skepticism and protect brand value.",
      highlightCopyLoss:
        "You focused on crisis containment rather than proactive disclosure. While your CMO was prepared to fight the fire, the Board criticised this reactive stance, arguing that transparency would have extinguished the rumours before they even started.",
      highlightLogo:
        "/assets/images/icons/end_of_year_logos/NotebookLM_Logo@3x_converted.webp",
    },
  },

  // Mo (CSCO)
  2: {
    0: {
      highlightTitleWin: "Keeping emissions down",
      highlightTitleLoss: "Keeping emissions down",
      highlightCopyWin:
        "You integrated a fleet telematics solution by Google Cloud partner, Geotab. The fleet management solution helped you gain real-time insights allowing you to optimise routes, improve fuel efficiency and reduce cost. Your commitment to more sustainable logistics reduced emissions and solidified investor confidence.",
      highlightCopyLoss:
        "By failing to implement Geotab, you missed critical fleet visibility. Inefficient routing made your supply chain fragile and prone to delays, while unnecessary mileage drove up costs. This inefficiency and high carbon footprint disappointed your stakeholders.",
      highlightLogo:
        "/assets/images/icons/end_of_year_logos/Geotab_Logo@3x_converted.webp",
    },
    1: {
      highlightTitleWin: "Compliance",
      highlightTitleLoss: "Compliance",
      highlightCopyWin:
        "You built an AI agent with Gemini Enterprise to assess compliance risks. It provided accurate, immediate answers without needing coding skills. This agility allowed you to proactively plan for compliance ahead of your competitors.",
      highlightCopyLoss:
        "You scheduled a manual ingredient audit, but the process proved too slow. By the time you identified affected products, competitors utilising AI had already adapted to the regulations. You are left scrambling to catch up while losing market share.",
      highlightLogo:
        "/assets/images/icons/end_of_year_logos/agents_Logo@3x_converted.webp",
    },
    3: {
      highlightTitleWin: "Optimising water use",
      highlightTitleLoss: "Optimising water use",
      highlightCopyWin:
        "You invested in climate-smart irrigation enabled by Cropin Sage, a solution by Google Cloud partner Cropin. Powered by Gemini, the solution combines generative AI with satellite data which allowed you to identify drought risks early. These decisions enhanced crop resilience against climate volatility while protecting your yield.",
      highlightCopyLoss:
        "You invested in climate-smart irrigation enabled by Cropin Sage, a solution by Google Cloud partner Cropin. Powered by Gemini, the solution combines generative AI with satellite data which allowed you to identify drought risks early. These decisions enhanced crop resilience against climate volatility while protecting your yield.",
      highlightLogo:
        "/assets/images/icons/end_of_year_logos/Cropin_Logo@3x_converted.webp",
    },
  },

  // Ali (CFO)
  3: {
    0: {
      highlightTitleWin: "Demand forecasting",
      highlightTitleLoss: "Demand forecasting",
      highlightCopyWin:
        "You implemented Google Cloud Vertex AI with AutoML, combining historical data with external trends and competitor activity. This improved forecasting accuracy across all SKUs, allowing Sunrise Cereals to react faster to market shifts, reduce waste, and increase operational efficiency, ultimately boosting profitability.",
      highlightCopyLoss:
        "You relied only on historical sales data to forecast demand. Trending competitor products and fast-moving consumer preferences were missed, leading to large volumes of unsold stock, wasted resources, and lost revenue, while competitors snapped up your market share.",
      highlightLogo:
        "/assets/images/icons/end_of_year_logos/Vertex AI_Logo@3x_converted.webp",
    },
    2: {
      highlightTitleWin: "Optimising water use",
      highlightTitleLoss: "Optimising water use",
      highlightCopyWin:
        "You invested in climate-smart irrigation enabled by Cropin Sage, a solution by Google Cloud partner Cropin. Powered by Gemini, the solution combines generative AI with satellite data which allowed you to identify drought risks early. These decisions enhanced crop resilience against climate volatility while protecting your yield.",
     highlightCopyLoss:
        "You invested in climate-smart irrigation enabled by Cropin Sage, a solution by Google Cloud partner Cropin. Powered by Gemini, the solution combines generative AI with satellite data which allowed you to identify drought risks early. These decisions enhanced crop resilience against climate volatility while protecting your yield.",
      highlightLogo:
        "/assets/images/icons/end_of_year_logos/Cropin_Logo@3x_converted.webp",
    },
    3: {
      highlightTitleWin: "Keeping emissions down",
      highlightTitleLoss: "Keeping emissions down",
      highlightCopyWin:
        "You integrated a fleet telematics solution by Google Cloud partner, Geotab. The fleet management solution helped you gain real-time insights allowing you to optimise routes, improve fuel efficiency and reduce cost. Your commitment to more sustainable logistics reduced emissions and solidified investor confidence.",
      highlightCopyLoss:
        "By failing to implement Geotab's solution, you missed critical fleet visibility. Inefficient routing made your supply chain fragile and prone to delays, while unnecessary mileage drove up costs. This inefficiency and high carbon footprint disappointed your stakeholders.",
      highlightLogo:
        "/assets/images/icons/end_of_year_logos/Geotab_Logo@3x_converted.webp",
    },
  },
};

export interface BuildEoyHighlightsDataOptions {
  highlightQuestionIndices?: number[];
}

export function buildEoyHighlightsData(
  options: BuildEoyHighlightsDataOptions = {}
): EoyHighlightsCharacter[] {
  const highlightQuestionIndices =
    options.highlightQuestionIndices ?? DEFAULT_EOY_HIGHLIGHT_QUESTION_INDICES;

  return characterProfiles.map((character) => {
    const scenarioSet = scenariosByCharacterIndex[character.index];
    if (!scenarioSet) {
      return { character, series: [] };
    }

    const perCharacterHighlightIndices =
      DEFAULT_EOY_HIGHLIGHT_QUESTION_INDICES_BY_CHARACTER_INDEX[
        character.index
      ] ?? highlightQuestionIndices;

    const series: EoyHighlightItem[] = scenarioSet.questions.map((q) => {
      const overrides =
        HIGHLIGHT_OVERRIDES_BY_CHARACTER_AND_QUESTION_INDEX[character.index]?.[
          q.questionIndex
        ];

      return {
        questionIndex: q.questionIndex,
        includeInEndOfYearHighlights: (
          perCharacterHighlightIndices ?? DEFAULT_EOY_HIGHLIGHT_QUESTION_INDICES
        ).includes(q.questionIndex),
        highlightTitleWin: overrides?.highlightTitleWin ?? q.questionTitle,
        highlightTitleLoss: overrides?.highlightTitleLoss,
        highlightCopyWin: overrides?.highlightCopyWin ?? q.scenarioDescription,
        highlightCopyLoss: overrides?.highlightCopyLoss,
        highlightLogo: overrides?.highlightLogo ?? DEFAULT_HIGHLIGHT_LOGO,
        highlightBackgroundImage: overrides?.highlightBackgroundImage,
        highlightVideoOverride: overrides?.highlightVideoOverride,
      };
    });

    return { character, series };
  });
}

export const eoyHighlightsData: EoyHighlightsCharacter[] =
  buildEoyHighlightsData();
