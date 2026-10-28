import type { CharacterScenarioSet } from "@/types/game";

export const characterIndex3Scenarios: CharacterScenarioSet = {
  characterIndex: 3,
  jobTitle: "CFO",
  questions: [
    {
      questionIndex: 0,
      questionTitle: "Demand Forecasting",
      questionEyebrow: "Scenario",
      scenarioDescription:
        "Relying on data from previous years to forecast demand – without taking into account external data like fast-moving trends and competitors’ promotions – has led to a large amount of Sunrise Cereals Co. product being wasted. How can Sunrise Cereals Co. minimise the negative impact?",
      scenarioVideo:
        "public/assets/video/scene_videos/character_3_scenarios/scenario_0/Ali_Scene1_Demandforecasting_Intro_KEYED_1_converted.mp4",
      actionChoices: [
        {
          actionDescription:
            "Leverage a deep learning model to improve demand forecasting in future",
          pointsImpact: 25,
          icon: "graph_5",
          isCorrectAnswer: true,
          postActionTitle: "Smarter Forecasts",
          postActionDescription:
            "By using Google Cloud's Vertex AI, you are able to incorporate external data with Sunrise Cereals Co.'s historical data. Using the AutoML feature, helps to improve forecasting accuracy, which enables you to capitalise on and react to trends much faster. This reduces waste, increases operational efficiency, and improves your bottom line.",
          postActionVideo:
            "public/assets/video/scene_videos/character_3_scenarios/scenario_0/post_action_vids/Ali_Scene1_Demandforecasting_Opt1_1_KEYED_converted.mp4",
        },
        {
          actionDescription: "Divert out-of-date product to biomass facilities",
          pointsImpact: -10,
          icon: "factory",
          isCorrectAnswer: false,
          postActionTitle: "Symptom, Not the Cause",
          postActionDescription:
            "Although diverting out-of-date product to biomass facilities is a more circular solution than landfill, it doesn't address the root of the waste problem – which is getting more and more costly for Sunrise Cereals Co.",
          postActionVideo:
            "public/assets/video/scene_videos/character_3_scenarios/scenario_0/post_action_vids/Ali_Scene1_Demandforecasting_Opt3_converted.mp4",
        },
        {
          actionDescription:
            "Launch a marketing campaign to promote the unused stock",
          pointsImpact: -10,
          icon: "finance_mode",
          isCorrectAnswer: false,
          postActionTitle: "Short-Term Lift",
          postActionDescription:
            "The campaign increases sales, but it’s time intensive, costly and doesn’t provide a long-term solution.",
          postActionVideo:
            "public/assets/video/scene_videos/character_3_scenarios/scenario_0/post_action_vids/Ali_Scene1_Demandforecasting_Opt2_converted.mp4",
        },
      ],
    },
    {
      questionIndex: 1,
      questionTitle: "Energy Efficiency",
      questionEyebrow: "Scenario",
      scenarioDescription:
        "With energy consumption increasing across sites, how can Sunrise Cereals Co. optimise energy use to minimise emissions and reduce energy costs?",
      scenarioVideo:
        "public/assets/video/scene_videos/character_3_scenarios/scenario_1/ALI_Scene1_Energy_Efficiency_Intro_KEYED_converted.mp4",
      actionChoices: [
        {
          actionDescription: "By installing solar panels and battery storage",
          pointsImpact: 25,
          icon: "solar_power",
          isCorrectAnswer: true,
          postActionTitle: "Partial Solution",
          postActionDescription:
            "Solar and battery storage helps Sunrise Cereals Co. offset its energy consumption costs. Combined with smart analytics and energy management, Sunrise Cereals Co. can also optimise manufacturing energy demand.",
          postActionVideo:
            "public/assets/video/scene_videos/character_3_scenarios/scenario_1/post_action_vids/Ali-CFO-EE-Install-solar-battery_converted.mp4",
        },
        {
          actionDescription:
            "Leverage smart grid analytics and energy management systems",
          pointsImpact: 25,
          icon: "graph_3",
          isCorrectAnswer: true,
          postActionTitle: "Optimised Energy Management",
          postActionDescription:
            "Thanks to integrating a cloud native energy management platform, Sunrise Cereals Co. is able to monitor consumption and leverage AI to help optimise energy use and ultimately reduce cost.",
          postActionVideo:
            "public/assets/video/scene_videos/character_3_scenarios/scenario_1/post_action_vids/ALI_Scene1_Energy_Efficiency_Opt2_KEYED_converted.mp4",
        },
        {
          actionDescription: "Hire a team of AI experts",
          pointsImpact: -10,
          icon: "account_circle",
          isCorrectAnswer: false,
          postActionTitle: "Slow Progress",
          postActionDescription:
            "After a lengthy investigation, your AI team drafts a comprehensive report suggesting using smart grid analytics and energy management systems.",
          postActionVideo:
            "public/assets/video/scene_videos/character_3_scenarios/scenario_1/post_action_vids/Ali-CFO-EE-HireAIExperts_converted.mp4",
        },
      ],
    },
    {
      questionIndex: 2,
      questionTitle: "Optimising Water Use",
      questionEyebrow: "Scenario",
      scenarioDescription:
        "With climate change, increased droughts are driving up the cost of ingredients. How can you optimise water use to help improve Sunrise Cereals Co.’s resilience?",
      scenarioVideo:
        "public/assets/video/scene_videos/character_3_scenarios/scenario_2/Ali_Scene1_OptomisingWater_Intro_converted.mp4",
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
            "public/assets/video/scene_videos/character_3_scenarios/scenario_2/post_action_vids/ALI_Scene1_OptimisingWater_Opt1_KEYED_converted.mp4",
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
            "public/assets/video/scene_videos/character_3_scenarios/scenario_2/post_action_vids/Ali_Scene1_OptomisingWater_Opt2_converted.mp4",
        },
      ],
    },
    {
      questionIndex: 3,
      questionTitle: "Fleet Optimisation",
      questionEyebrow: "Scenario",
      scenarioDescription:
        "Last year, you deployed an AI-powered route optimisation system, but now increasing logistics costs in Europe are hitting Sunrise Cereals Co.'s revenue. What’s the next step in optimising your supply chain?",
      scenarioVideo:
        "public/assets/video/scene_videos/character_3_scenarios/scenario_3/Ali_Scene4_FleetOptomisation_Intro_UPDATED_converted.mp4",
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
            "public/assets/video/scene_videos/character_3_scenarios/scenario_3/post_action_vids/ALI_Scene1_FleetOptimisation_Opt1_KEYED_converted.mp4",
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
            "public/assets/video/scene_videos/character_3_scenarios/scenario_3/post_action_vids/Ali_Scene4_FleetOptomisation_Opt2_converted.mp4",
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
            "public/assets/video/scene_videos/character_3_scenarios/scenario_3/post_action_vids/Ali_Scene4_FleetOptomisation_Opt3UPDATED_converted.mp4",
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
        "public/assets/video/scene_videos/character_3_scenarios/scenario_4/Ali_characters_Scenario5_Impact_Of_AI_Setting_Scene_KEYED.mp4_converted.mp4",
      actionChoices: [
        {
          actionDescription:
            "Train your IT team on building software sustainably principles",
          pointsImpact: 15,
          icon: "nest_eco_leaf",
          isCorrectAnswer: true,
          postActionTitle: "Sustainable AI Principles",
          postActionDescription:
            "By implementing the 4Ms AI architecture by Google Cloud, Sunrise Cereals Co. reduces the carbon footprint of its AI workloads, minimises costs and maintains scalability.",
          postActionVideo:
            "public/assets/video/scene_videos/character_3_scenarios/scenario_4/post_action_vids/Ali_Scenario5_Impact_Of_AI_IT_Team_KEYED_converted.mp4",
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
            "public/assets/video/scene_videos/character_3_scenarios/scenario_4/post_action_vids/Ali_Scenario5_Impact_Of_AI_carbon_text_KEYED_converted.mp4",
        },
      ],
    },
  ],
};
