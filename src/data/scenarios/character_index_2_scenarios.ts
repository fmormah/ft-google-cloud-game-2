import type { CharacterScenarioSet } from "@/types/game";

export const characterIndex2Scenarios: CharacterScenarioSet = {
  characterIndex: 2,
  jobTitle: "CSCO",
  questions: [
    {
      questionIndex: 0,
      questionTitle: "Fleet Optimisation",
      questionEyebrow: "Scenario",
      scenarioDescription:
        "Last year, you deployed an AI-powered route optimisation system, but now increasing logistics costs in Europe are hitting Sunrise Cereals Co.'s revenue. What’s the next step in optimising your supply chain?",
      scenarioVideo:
        "public/assets/video/scene_videos/character_2_scenarios/scenario_0/Mo_Scene1_FleetOptomisation_IntroUPDATED_converted.mp4",
      actionChoices: [
        {
          actionDescription:
            "Leverage an AI-powered fleet tracking and logistics system",
          pointsImpact: 25,
          icon: "ads_click",
          isCorrectAnswer: true,
          postActionTitle: "Optimised Fleet Management",
          postActionDescription:
            "By implementing a solution by Google Cloud partner Geotab, you're able to identify further improvements and forecast your potential cost savings and CO2 reduction.",
          postActionVideo:
            "public/assets/video/scene_videos/character_2_scenarios/scenario_0/post_action_vids/MO_Scene1_FleetOptimisation_Opt1_KEYED_converted.mp4",
        },
        {
          actionDescription:
            "Electrify your fleet in markets with charging availability",
          pointsImpact: 25,
          icon: "bolt",
          isCorrectAnswer: true,
          postActionTitle: "Limited Fleet Electrification",
          postActionDescription:
            "While it was a significant upfront investment, electrifying your fleet has secured long-term cost and carbon savings. Implementing a solution by Google Cloud partner Geotab alongside this would help with further efficiency gains",
          postActionVideo:
            "public/assets/video/scene_videos/character_2_scenarios/scenario_0/post_action_vids/Mo_Scene1_FleetOptomisation_Opt2_Updated_converted.mp4",
        },
        {
          actionDescription:
            "You’re satisfied with your optimisation efforts so far",
          pointsImpact: -10,
          icon: "sentiment_satisfied",
          isCorrectAnswer: false,
          postActionTitle: "Stagnant Optimisation",
          postActionDescription:
            "As costs continue to rise, your overheads pile up and shareholders demand to understand why your failure to optimise is affecting profits.",
          postActionVideo:
            "public/assets/video/scene_videos/character_2_scenarios/scenario_0/post_action_vids/Mo_Scenario1_FleetOptimisationGeotab_Satisified_converted.mp4",
        },
      ],
    },
    {
      questionIndex: 1,
      questionTitle: "Regulatory Compliance",
      questionEyebrow: "Scenario",
      scenarioDescription:
        "With the enforcement of EU regulations impacting different ingredients, how do you assess the risk this poses to Sunrise Cereals Co.'s products?",
      scenarioVideo:
        "public/assets/video/scene_videos/character_2_scenarios/scenario_1/Mo_Scenario3_Regulatory_Compliance_Intro_KEYED_converted.mp4",
      actionChoices: [
        {
          actionDescription:
            "Schedule a full ingredient audit from the product team",
          pointsImpact: -10,
          icon: "grocery",
          isCorrectAnswer: false,
          postActionTitle: "Delayed Response",
          postActionDescription:
            "You get the list of affected products, but it’s too late. By using AI to collate data, your competitors have been able to adapt to regulation changes faster and more accurately.",
          postActionVideo:
            "public/assets/video/scene_videos/character_2_scenarios/scenario_1/post_action_vids/Mo_Scenario3_RegulatoryCompliance_Opt1_KEYED_converted.mp4",
        },
        {
          actionDescription:
            "Design an AI agent that allows easy access to answers",
          pointsImpact: 15,
          icon: "bar_chart_4_bars",
          isCorrectAnswer: true,
          postActionTitle: "Proactive Compliance",
          postActionDescription:
            "Your AI agent in Gemini Enterprise provides highly accurate answers that are accessible to the team quickly without the need for coding or specialist knowledge. Your agent has allowed you to get ahead of competitors.",
          postActionVideo:
            "public/assets/video/scene_videos/character_2_scenarios/scenario_1/post_action_vids/Mo_Scene3_RegulatoryCompliance_Opt2_KEYED_converted.mp4",
        },
      ],
    },
    {
      questionIndex: 2,
      questionTitle: "Supply Chain Transparency",
      questionEyebrow: "Scenario",
      scenarioDescription:
        "One of your suppliers has been named in an article alleging unsustainable agricultural practices. How can you protect Sunrise Cereals Co.'s reputation and prove compliance and traceability at your upcoming shareholder meeting?",
      scenarioVideo:
        "public/assets/video/scene_videos/character_2_scenarios/scenario_2/Mo_Scene3_SupplyChainTransparency_Intro_UPDATED.mp4",
      actionChoices: [
        {
          actionDescription: "Plan quarterly visits to your supplier",
          pointsImpact: -10,
          icon: "language",
          isCorrectAnswer: false,
          postActionTitle: "Limited Visibility",
          postActionDescription:
            "Visiting the supplier gives you visibility, but at the cost of time and money, and it doesn’t give you proof you can use to demonstrate sustainability to shareholders.",
          postActionVideo:
            "public/assets/video/scene_videos/character_2_scenarios/scenario_2/post_action_vids/Mo_Scene3_SupplyChainTransparency_Opt1_KEYED_converted.mp4",
        },
        {
          actionDescription: "Leverage a sustainable sourcing platform",
          pointsImpact: 25,
          icon: "orbit",
          isCorrectAnswer: true,
          postActionTitle: "Enhanced Supply Chain Transparency",
          postActionDescription:
            "Using AI and a combination of satellite imagery, publicly-available and internal data, TraceMark's sustainable sourcing platform increases supply chain transparency for Sunrise Cereals Co. This proves compliance and impresses shareholders.",
          postActionVideo:
            "public/assets/video/scene_videos/character_2_scenarios/scenario_2/post_action_vids/Mo_Scene3_SupplyChainTransparency_Opt3_KEYED_converted.mp4",
        },
        {
          actionDescription: "Hire an AI team to analyse supplier reports",
          pointsImpact: -10,
          icon: "account_circle",
          isCorrectAnswer: false,
          postActionTitle: "Insufficient Transparency",
          postActionDescription:
            "Relying purely on supplier’s reporting is not enough to satisfy stakeholders at the shareholder meeting. They demand a more transparent system.",
          postActionVideo:
            "public/assets/video/scene_videos/character_2_scenarios/scenario_2/post_action_vids/Mo_Scene3_SupplyChainTransparency_Opt3_UPDATED_NOVO_converted.mp4",
        },
      ],
    },
    {
      questionIndex: 3,
      questionTitle: "Optimising Water Use",
      questionEyebrow: "Scenario",
      scenarioDescription:
        "With climate change, increased droughts are driving up the cost of ingredients. How can you optimise water use to help improve Sunrise Cereals Co.’s resilience?",
      scenarioVideo:
        "public/assets/video/scene_videos/character_2_scenarios/scenario_3/Mo_Scene3_OptomisingWater_Intro_converted.mp4",
      actionChoices: [
        {
          actionDescription:
            "Invest in a Gen-AI agri-intelligence platform for smart irrigation, climate and crop analytics",
          pointsImpact: 25,
          icon: "browse_activity",
          isCorrectAnswer: true,
          postActionTitle: "Optimised Water Management",
          postActionDescription:
            "Drought risks are identified early and water stress is mitigated thanks to Google Cloud partner Cropin and their climate-smart irrigation solution. Data driven decisions are made by combining AI with satellite, IoT and weather pattern data for enhanced crop resilience.",
          postActionVideo:
            "public/assets/video/scene_videos/character_2_scenarios/scenario_3/post_action_vids/MO_Scene3_OptimisingWaterUse_Opt1_KEYED_converted.mp4",
        },
        {
          actionDescription:
            "Reduce production and increase price on affected products",
          pointsImpact: -10,
          icon: "grocery",
          isCorrectAnswer: false,
          postActionTitle: "Lost Market Share",
          postActionDescription:
            "After reducing production, sales begin to decline. Competitors gain market share thanks to investment in agri-intelligence solutions for water optimisation.",
          postActionVideo:
            "public/assets/video/scene_videos/character_2_scenarios/scenario_3/post_action_vids/Mo_Scene3_OptomisingWater_Opt2_converted.mp4",
        },
      ],
    },
    {
      questionIndex: 4,
      questionTitle: "Impact of AI",
      questionEyebrow: "Scenario",
      scenarioDescription:
        "Over the past few months, Sunrise Cereals Co.’s AI use has increased significantly. You’re aware that this can be energy intensive. How do you balance business impact with your Net Zero goal?",
      scenarioVideo:
        "public/assets/video/scene_videos/character_2_scenarios/scenario_4/Mo_characters_Scenario5_Impact_Of_AI_Setting_Scene_KEYED.mp4_converted.mp4",
      actionChoices: [
        {
          actionDescription:
            "Train your IT team on building software sustainably principles",
          pointsImpact: 15,
          icon: "nest_eco_leaf",
          isCorrectAnswer: true,
          postActionTitle: "Sustainable AI Architecture",
          postActionDescription:
            "By implementing the 4Ms AI architecture by Google Cloud, Sunrise Cereals Co. reduces the carbon footprint of its AI workloads, minimises costs and maintains scalability.",
          postActionVideo:
            "public/assets/video/scene_videos/character_2_scenarios/scenario_4/post_action_vids/Mo_Scenario5_Impact_Of_AI_IT_Team_KEYED_converted.mp4",
        },
        {
          actionDescription:
            "Buy enough carbon credits to balance out your emissions.",
          pointsImpact: -10,
          icon: "account_circle",
          isCorrectAnswer: false,
          postActionTitle: "Greenwashing Scrutiny",
          postActionDescription:
            "Although carbon credits make a positive impact on paper, they should only be used as a last resort. The business is now under scrutiny for greenwashing and no closer to its net zero goal.",
          postActionVideo:
            "public/assets/video/scene_videos/character_2_scenarios/scenario_4/post_action_vids/Mo_Scenario5_Impact_Of_AI_carbon_text_KEYED_converted.mp4",
        },
      ],
    },
  ],
};
