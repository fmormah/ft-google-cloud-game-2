import type { CharacterProfile } from "@/types/game";

export const characterProfiles: CharacterProfile[] = [
  {
    index: 0,
    name: "Stella",
    jobTitle: "Chief Executive Officer",
    characterSelectVideoIndex: {
      desktop: 0,
      mobile: 0,
    },
    characterDescription:
      "Pursues her vision for Sunrise Cereals Co. as a profitable, sustainable company",
  },
  {
    index: 1,
    name: "Sidney",
    jobTitle: "Chief Information Officer",
    characterSelectVideoIndex: {
      desktop: 3,
      mobile: 3,
    },
    characterDescription:
      "Leverages IT to help Sunrise Cereals Co. deliver on commitments efficiently",
  },
  {
    index: 2,
    name: "Mo",
    jobTitle: "Chief Supply Chain Officer",
    characterSelectVideoIndex: {
      desktop: 6,
      mobile: 6,
    },
    characterDescription:
      "Drives financial and environmental efficiency in Sunrise Cereals Co.'s ops",
  },
  {
    index: 3,
    name: "Ali",
    jobTitle: "Chief Financial Officer",
    characterSelectVideoIndex: {
      desktop: 8.75,
      mobile: 8.75,
    },
    characterDescription:
      "Ensures Sunrise Cereals Co is financially resilient enough to grow sustainably",
  },
];
