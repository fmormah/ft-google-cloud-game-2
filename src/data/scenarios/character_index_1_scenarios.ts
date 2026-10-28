import type { CharacterScenarioSet } from "@/types/game";

export const characterIndex1Scenarios: CharacterScenarioSet = {
  characterIndex: 1,
  jobTitle: "CIO",
  questions: [
    {
      questionIndex: 0,
      questionTitle: "Cybersecurity",
      questionEyebrow: "Scenario",
      scenarioDescription:
        "After speaking with your CEO, she informs you that cybersecurity threats are on the rise. How do you keep Sunrise Cereal Co.'s data safe from potential cyber attacks?",
      scenarioVideo:
        "public/assets/video/scene_videos/character_1_scenarios/scenario_0/Sydney_Scene1_CyberSecurity_Intro_converted.mp4",
      actionChoices: [
        {
          actionDescription:
            "Implement AI threat detection for risk mitigation insights",
          pointsImpact: 15,
          icon: "crisis_alert",
          isCorrectAnswer: true,
          postActionTitle: "Proactive Threat Detection",
          postActionDescription:
            "By empowering your intel analysts with AI-powered threat detection, you’re able to mitigate cyber security risk, empowering Sunrise Cereals Co.’s to grow securely.",
          postActionVideo:
            "public/assets/video/scene_videos/character_1_scenarios/scenario_0/post_action_vids/Sydney_Scene1_CyberSecurity_Opt1_converted.mp4",
        },
        {
          actionDescription:
            "Enforce stricter policies for employees to limit exposure",
          pointsImpact: -10,
          icon: "admin_panel_settings",
          isCorrectAnswer: false,
          postActionTitle: "Policy Headwinds",
          postActionDescription:
            "Your stricter policies reduce threats, but they take time to draft and require supervision. Using an AI-powered threat detection would let Sunrise Cereals Co. intel analysts identify and neutralise threats faster.",
          postActionVideo:
            "public/assets/video/scene_videos/character_1_scenarios/scenario_0/post_action_vids/Sydney_Scene1_CyberSecurity_Opt2_converted.mp4",
        },
      ],
    },
    {
      questionIndex: 1,
      questionTitle: "Climate-related Risk and Resilience",
      questionEyebrow: "Scenario",
      scenarioDescription:
        "Increased extreme weather events are affecting premises around the world. How can Sunrise Cereals Co. make sure its investments – both current and future – are protected?",
      scenarioVideo:
        "public/assets/video/scene_videos/character_1_scenarios/scenario_1/Syndey_Scene2_ClimateRiskResilence_Intro_UPDATED.mp4",
      actionChoices: [
        {
          actionDescription:
            "Implement an AI-enabled planetary risk and opportunity assessment platform",
          pointsImpact: 25,
          icon: "assignment",
          isCorrectAnswer: true,
          postActionTitle: "AI-Driven Risk Assessment",
          postActionDescription:
            "Using SpatiaFi enables you to identify physical vulnerabilities and model financial impact. This Google Cloud partner solution by Earth Finance helps you to make smarter investment decisions.",
          postActionVideo:
            "public/assets/video/scene_videos/character_1_scenarios/scenario_1/post_action_vids/Sydney_Scene2_ClimateRisk&Resilience_Opt1_KEYED_converted.mp4",
        },
        {
          actionDescription: "Reassure the board about your current plans",
          pointsImpact: -10,
          icon: "adaptive_audio_mic",
          isCorrectAnswer: false,
          postActionTitle: "Insufficient Assurance",
          postActionDescription:
            "Without clear risk and ROI modelling, the Board remain unconvinced.",
          postActionVideo:
            "public/assets/video/scene_videos/character_1_scenarios/scenario_1/post_action_vids/Sydney_Scene2_ClimateRisk&Resilience_Opt2_KEYED.mp4_converted.mp4",
        },
        {
          actionDescription: "Hire an AI team to investigate solutions",
          pointsImpact: -10,
          icon: "account_circle",
          isCorrectAnswer: false,
          postActionTitle: "Delayed Action",
          postActionDescription:
            "After lengthy investigation, the AI team recommend adopting SpatiaFi to assess risk and opportunity, but the delay in action worries the Board.",
          postActionVideo:
            "public/assets/video/scene_videos/character_1_scenarios/scenario_1/post_action_vids/Sydney_Scene2_ClimateRisk&Resilience_Opt3_KEYED_converted.mp4",
        },
      ],
    },
    {
      questionIndex: 2,
      questionTitle: "Energy Efficiency",
      questionEyebrow: "Scenario",
      scenarioDescription:
        "With energy consumption increasing across sites, how can Sunrise Cereals Co. optimise energy use to minimise emissions and reduce energy costs?",
      scenarioVideo:
        "public/assets/video/scene_videos/character_1_scenarios/scenario_2/Sidney_Scene3_EngeryEffiency_Intro_KEYED.mp4_converted.mp4",
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
            "public/assets/video/scene_videos/character_1_scenarios/scenario_2/post_action_vids/Sidney-CIO-EE-Install-solar-battery_converted.mp4",
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
            "public/assets/video/scene_videos/character_1_scenarios/scenario_2/post_action_vids/Sydney_Scene3_EngeryEffiency_opt2_KEYED_converted.mp4",
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
            "public/assets/video/scene_videos/character_1_scenarios/scenario_2/post_action_vids/Sidney-CIO-EE-HireAIExperts_converted.mp4",
        },
      ],
    },
    {
      questionIndex: 3,
      questionTitle: "Greenwashing PR Crisis",
      questionEyebrow: "Scenario",
      scenarioDescription:
        "Seeing another brand accused of greenwashing, you realise you need a plan in case it happens to Sunrise Cereals Co. How do you protect your brand’s reputation?",
      scenarioVideo:
        "public/assets/video/scene_videos/character_1_scenarios/scenario_3/Sidney_Scene4_GreenwashingPRCrisis_Intro_converted.mp4",
      actionChoices: [
        {
          actionDescription:
            "Implement an AI solution for public access to company and supply chain data",
          pointsImpact: 15,
          icon: "area_chart",
          isCorrectAnswer: true,
          postActionTitle: "Transparent by Design",
          postActionDescription:
            "The notebook you created with NotebookLM by Google Cloud, enables quick analysis of your latest environmental report and supplier data, which builds trust with your customers.",
          postActionVideo:
            "public/assets/video/scene_videos/character_1_scenarios/scenario_3/post_action_vids/Sydney_Scene2_GreenwashingPRCrisis_Opt2_UPDATED.mp4",
        },
        {
          actionDescription:
            "Request an in-depth report and supplier audit from your ESG team",
          pointsImpact: -10,
          icon: "article",
          isCorrectAnswer: false,
          postActionTitle: "Slow Reassurance",
          postActionDescription:
            "Although the ESG report and supplier audit reassure you about Sunrise Cereals Co.’s practices, the amount of time it takes could delay your ability to respond.",
          postActionVideo:
            "public/assets/video/scene_videos/character_1_scenarios/scenario_3/post_action_vids/Sydney_Scene2_GreenwashingPRCrisis_Opt2.mp4",
        },
        {
          actionDescription:
            "Check you have a crisis response in place with your CMO",
          pointsImpact: -10,
          icon: "emergency_home",
          isCorrectAnswer: false,
          postActionTitle: "Reactive-Only Preparedness",
          postActionDescription:
            "Your CMO confirms that a crisis response plan is in place, but the Board question whether Sunrise Cereals Co. could have taken a more proactive, preventative approach.",
          postActionVideo:
            "public/assets/video/scene_videos/character_1_scenarios/scenario_3/post_action_vids/Sydney_Scene2_GreenwashingPRCrisis_Op3UPDATE.mp4",
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
        "public/assets/video/scene_videos/character_1_scenarios/scenario_4/Sydney_characters_Scenario5_Impact_Of_AI_Setting_Scene_KEYED.mp4_converted.mp4",
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
            "public/assets/video/scene_videos/character_1_scenarios/scenario_4/post_action_vids/Sidney_Scenario5_Impact_Of_AI_IT_Team_KEYED_converted.mp4",
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
            "public/assets/video/scene_videos/character_1_scenarios/scenario_4/post_action_vids/Sydney_Scenario5_Impact_Of_AI_carbon_text_KEYED_converted.mp4",
        },
      ],
    },
  ],
};
