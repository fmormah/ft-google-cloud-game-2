import type { CharacterScenarioSet } from "@/types/game";

export const characterIndex0Scenarios: CharacterScenarioSet = {
  characterIndex: 0,
  jobTitle: "CEO",
  questions: [
    {
      questionIndex: 0,
      questionTitle: "Supply Chain Transparency",
      questionEyebrow: "Scenario",
      scenarioDescription:
        "One of your suppliers has been named in an article alleging unsustainable agricultural practices. How can you protect Sunrise Cereals Co.'s reputation and prove compliance and traceability at your upcoming shareholder meeting?",
      scenarioVideo:
        "public/assets/video/scene_videos/character_0_scenarios/scenario_0/Stella_Scene1_SupplyChainTransparency_Intro_KEYED_converted.mp4",
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
            "public/assets/video/scene_videos/character_0_scenarios/scenario_0/post_action_vids/STELLA_SCT_02_PlanQuarterlyVisitsUPDATED.mp4",
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
            "public/assets/video/scene_videos/character_0_scenarios/scenario_0/post_action_vids/Stella_Scene1_SupplyChainTransparency_Opt2_KEYED_converted.mp4",
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
            "public/assets/video/scene_videos/character_0_scenarios/scenario_0/post_action_vids/Stella_Scene1_SupplyChainTransparency_Opt3_UPDATED_NOVO.mp4",
        },
      ],
    },
    {
      questionIndex: 1,
      questionTitle: "Demand Forecasting",
      questionEyebrow: "Scenario",
      scenarioDescription:
        "Relying on data from previous years to forecast demand – without taking into account external data like fast-moving trends and competitors’ promotions – has led to a large amount of Sunrise Cereals Co. product being wasted. How can Sunrise Cereals Co. minimise the negative impact?",
      scenarioVideo:
        "public/assets/video/scene_videos/character_0_scenarios/scenario_1/Stella_Scene2_Demand_Forecasing_Intro_KEYED_converted.mp4",
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
            "public/assets/video/scene_videos/character_0_scenarios/scenario_1/post_action_vids/Stella_Scene2_Demand_Forecasing_Opt1_KEYED_converted.mp4",
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
            "public/assets/video/scene_videos/character_0_scenarios/scenario_1/post_action_vids/Stella_Scene2_Demand_Forecasing_Opt3.mp4",
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
            "public/assets/video/scene_videos/character_0_scenarios/scenario_1/post_action_vids/Stella_Scene2_Demand_Forecasing_Opt2.mp4",
        },
      ],
    },
    {
      questionIndex: 2,
      questionTitle: "Scaling Internationally",
      questionEyebrow: "Scenario",
      scenarioDescription:
        "As part of their risk mitigation strategy for expanding into new markets, the local teams want to ensure data stays in Europe to enable enhanced control and digital autonomy. How will you protect company data in these new markets?",
      scenarioVideo:
        "public/assets/video/scene_videos/character_0_scenarios/scenario_2/Stella_Scene2_ScalingInterantional_Intro.mp4",
      actionChoices: [
        {
          actionDescription:
            "Roll out a browser web extension to notify your team of potential risks.",
          pointsImpact: -10,
          icon: "select_window",
          isCorrectAnswer: false,
          postActionTitle: "Reactive Risk Management",
          postActionDescription:
            "Notifications are received by your technology department, and they draft new policies in response. However, the evolving regulatory and geo-political landscape means you will be constantly managing new risks.",
          postActionVideo:
            "public/assets/video/scene_videos/character_0_scenarios/scenario_2/post_action_vids/Stella_Scene2_ScalingInterantional_Opt1_converted.mp4",
        },
        {
          actionDescription:
            "Work with a cloud sovereignty partner to set up data boundaries for data residency and access control over AI deployments.",
          pointsImpact: 15,
          icon: "cloud",
          isCorrectAnswer: true,
          postActionTitle: "Sovereign Data Boundaries",
          postActionDescription:
            "A Sovereign Cloud Provider acts as an enabler to unlocking AI value. Allowing Sunrise Cereals Co. to store and manage their encryption keys, while meeting data access and control requirements globally.",
          postActionVideo:
            "public/assets/video/scene_videos/character_0_scenarios/scenario_2/post_action_vids/Stella_Scene2_ScalingInterantional_Opt2_converted.mp4",
        },
      ],
    },
    {
      questionIndex: 3,
      questionTitle: "Cybersecurity",
      questionEyebrow: "Scenario",
      scenarioDescription:
        "After speaking with your CIO, she informs you that cybersecurity threats are on the rise. How do you keep Sunrise Cereal Co.'s data safe from potential cyber attacks?",
      scenarioVideo:
        "public/assets/video/scene_videos/character_0_scenarios/scenario_3/Stella_Scene4_CyberSecurity_Intro_converted.mp4",
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
            "public/assets/video/scene_videos/character_0_scenarios/scenario_3/post_action_vids/Stella_Scene4_CyberSecurity_Opt1_converted.mp4",
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
            "public/assets/video/scene_videos/character_0_scenarios/scenario_3/post_action_vids/Stella_Scene4_CyberSecurity_Opt2_converted.mp4",
        },
      ],
    },
    {
      questionIndex: 4,
      questionTitle: "Impact of AI",
      questionEyebrow: "Scenario",
      scenarioDescription:
        "Over the past few months, Sunrise Cereals Co.'s AI use has increased significantly. You’re aware that this can be energy intensive. How do you balance business impact with your Net Zero goal?",
      scenarioVideo:
        "public/assets/video/scene_videos/character_0_scenarios/scenario_4/Stella_characters_Scenario5_Impact_Of_AI_Setting_Scene_KEYED.mp4_converted.mp4",
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
            "public/assets/video/scene_videos/character_0_scenarios/scenario_4/post_action_vids/Stella_Scenario5_Impact_Of_AI_IT_Team_KEYED_converted.mp4",
        },
        {
          actionDescription:
            "Buy enough carbon credits to balance out your emissions.",
          pointsImpact: -10,
          icon: "account_circle",
          isCorrectAnswer: false,
          postActionTitle: "Greenwashing Concerns",
          postActionDescription:
            "Although carbon credits make a positive impact on paper, they should only be used as a last resort. The business is now under scrutiny for greenwashing and no closer to its net zero goal.",
          postActionVideo:
            "public/assets/video/scene_videos/character_0_scenarios/scenario_4/post_action_vids/Stella_Scenario5_Impact_Of_AI_carbon_text_KEYED_converted.mp4",
        },
      ],
    },
  ],
};
